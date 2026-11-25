// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import CheckoutSummary from "../../../components/user/checkout/CheckoutSummary";
import { formatMoney } from "../../../services/format";

it("exibe no resumo o preço promocional de cada unidade", () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() => {
    root.render(<MemoryRouter><CheckoutSummary items={[{
      id: 1, quantity: 2, listing: { price: 0.04, pricing: { finalPrice: 0.02, discountPercentage: 50 }, game: { title: "Jogo" } },
    }]} subtotal={0.04} totalQuantity={2} hasStockIssues={false} /></MemoryRouter>);
  });
  expect(container.textContent).toContain(formatMoney(0.04));
  expect(container.textContent).not.toContain(formatMoney(0.08));
  act(() => root.unmount());
  vi.restoreAllMocks();
});
