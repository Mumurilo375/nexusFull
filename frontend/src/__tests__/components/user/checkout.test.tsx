// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Checkout from "../../../components/user/checkout/Checkout";
import api from "../../../services/api";
import type { CheckoutOrderResponse } from "../../../components/user/checkout/checkout.types";

vi.mock("../../../services/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
const pending = { id: 1, orderNumber: "NEX-1", totalAmount: 50, status: "pending", checkoutUrl: "https://sandbox.mercadopago.com.br/test", paymentExpiresAt: "2026-11-08T15:00:00Z" };
let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => { await act(async () => { root.unmount(); await Promise.resolve(); }); container.remove(); vi.useRealTimers(); });

async function render(order: CheckoutOrderResponse | null, items: unknown[] = []) {
  vi.spyOn(api, "get").mockImplementation((url) => Promise.resolve({ data: url === "/cart" ? { items } : { order } }));
  await act(async () => { root.render(<MemoryRouter><Checkout /></MemoryRouter>); await Promise.resolve(); });
}

describe("checkout Mercado Pago", () => {
  it("oferece o checkout hospedado sem coletar dados de cartão", async () => {
    await render(null, [{ id: 1, quantity: 1, listing: { price: 50, game: { title: "Jogo" } } }]);
    expect(container.textContent).toContain("Continuar para pagamento");
    expect(container.querySelector("input")).toBeNull();
  });
  it("mostra uma reserva pendente sem anunciar entrega e atualiza após confirmação", async () => {
    await render(pending);
    expect(container.textContent).toContain("Aguardando pagamento");
    expect(container.textContent).not.toContain("Suas keys já estão disponíveis");
    expect(container.querySelector("a[href^='https://sandbox.mercadopago']")).not.toBeNull();
    vi.spyOn(api, "get").mockResolvedValue({ data: { order: { ...pending, status: "paid", checkoutUrl: null } } });
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(container.textContent).toContain("Pagamento confirmado");
    expect(container.textContent).toContain("Suas keys já estão disponíveis");
  });
  it("mostra falha e o caminho para refazer o carrinho", async () => {
    await render({ ...pending, status: "failed" });
    expect(container.textContent).toContain("Pagamento não concluído");
    expect(container.querySelector("a[href='/carrinho']")).not.toBeNull();
  });
  it("permite republicar o evento e paga quando a URL chegar", async () => {
    await render({ ...pending, checkoutUrl: null });
    expect(container.textContent).toContain("Preparando pagamento");
    expect(container.textContent).toContain("Seu pedido está salvo");
    expect(container.textContent).not.toContain("Já paguei");
    expect(container.querySelector("a[href^='https://sandbox.mercadopago']")).toBeNull();
    const post = vi.spyOn(api, "post").mockResolvedValue({ data: { order: { ...pending, checkoutUrl: null } } });
    const retry = [...container.querySelectorAll("button")].find((button) => button.textContent?.includes("Tentar preparar pagamento"));
    await act(async () => { retry?.click(); await Promise.resolve(); });
    expect(post).toHaveBeenCalledWith("/checkout/1/prepare");
    vi.spyOn(api, "get").mockResolvedValue({ data: { order: pending } });
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(container.textContent).toContain("Aguardando pagamento");
    expect(container.querySelector("a[href^='https://sandbox.mercadopago']")).not.toBeNull();
  });
});
