// @vitest-environment jsdom
/* eslint-disable @typescript-eslint/unbound-method */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import PendingCheckoutNotice from "../../../components/user/checkout/PendingCheckoutNotice";
import api from "../../../services/api";

const auth = { isAuthenticated: true, user: { id: 1 } };
vi.mock("../../../contexts/useAuth", () => ({ useAuth: () => auth }));
vi.mock("../../../services/api", () => ({ default: { get: vi.fn() } }));
const pending = { id: 42, status: "pending", orderNumber: "NEX-42", totalAmount: 50,
  checkoutUrl: null, paymentExpiresAt: new Date(Date.now() + 1800000).toISOString() };
let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  auth.isAuthenticated = true;
  container = document.createElement("div"); document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => { await act(async () => { root.unmount(); await Promise.resolve(); }); container.remove(); });
async function render(path = "/loja") {
  await act(async () => { root.render(<MemoryRouter initialEntries={[path]}><PendingCheckoutNotice /></MemoryRouter>); await Promise.resolve(); });
}

it("ao voltar à loja oferece retomar o pedido mesmo sem URL pronta", async () => {
  vi.mocked(api.get).mockResolvedValue({ data: { order: pending } });
  await render();
  expect(container.textContent).toContain("Você tem uma compra em andamento");
  expect(container.textContent).toContain("Estamos preparando seu pagamento");
  expect(container.querySelector("a")?.getAttribute("href")).toBe("/checkout?orderId=42");
});

it("não mostra aviso para visitante, checkout aberto ou usuário sem compra pendente", async () => {
  auth.isAuthenticated = false;
  await render();
  expect(api.get).not.toHaveBeenCalled();
  expect(container.textContent).toBe("");
});

it("não mostra aviso por cima do próprio checkout", async () => {
  vi.mocked(api.get).mockResolvedValue({ data: { order: pending } });
  await render("/checkout");
  expect(api.get).not.toHaveBeenCalled();
  expect(container.textContent).toBe("");
});

it("não mostra aviso quando não há pedido pendente", async () => {
  vi.mocked(api.get).mockResolvedValue({ data: { order: null } });
  await render();
  expect(container.textContent).toBe("");
});
