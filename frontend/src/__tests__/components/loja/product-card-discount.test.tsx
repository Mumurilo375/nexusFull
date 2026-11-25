// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import ProductCard from "../../../components/loja/ProductCard";
import type { ListingItem } from "../../../components/loja/store.types";

it("mostra o preço e o desconto apenas para a plataforma em oferta", () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const container = document.createElement("div");
  const root = createRoot(container);
  const xbox: ListingItem = { id: 10, price: 0.04, platform: { id: 1, name: "Xbox" }, pricing: { basePrice: 0.04, finalPrice: 0.02, discountPercentage: 50 } };
  const steam: ListingItem = { id: 11, price: 0.04, platform: { id: 2, name: "Steam" }, pricing: { basePrice: 0.04, finalPrice: 0.04, discountPercentage: 0 } };
  const render = (selectedListing: ListingItem) => <ProductCard game={{ id: 1, title: "Jogo", description: "" }} listings={[xbox, steam]} selectedListing={selectedListing} showOfferPricing compact inCart={false} isFavorite={false} pendingFavorite={false} pendingCart={false} onOpen={vi.fn()} onToggleFavorite={vi.fn()} onSelectListing={vi.fn()} onAddToCart={vi.fn()} />;

  act(() => root.render(render(xbox)));
  expect(container.textContent).toContain("R$ 0.02");
  expect(container.textContent).toContain("R$ 0.04");
  expect(container.textContent).toContain("-50%");

  act(() => root.render(render(steam)));
  expect(container.textContent).toContain("R$ 0.04");
  expect(container.textContent).not.toContain("-50%");
  act(() => root.unmount());
});
