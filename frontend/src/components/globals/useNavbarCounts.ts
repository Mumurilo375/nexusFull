import { useEffect, useState } from "react";
import api from "../../services/api";
import type { NavbarCartResponse } from "./globals.types";

const COUNTS_CACHE_TTL_MS = 30_000;
let countsCache: { wishlistCount: number; cartCount: number; updatedAt: number } | null = null;

export function useNavbarCounts(isLoggedIn: boolean) {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    const resetCounts = () => {
      setWishlistCount(0);
      setCartCount(0);
    };

    const loadCounts = async () => {
      try {
        const [{ data: wishlistData }, { data: cartData }] = await Promise.all([
          api.get<{ items?: Array<{ id?: number }> }>("/wishlists"),
          api.get<NavbarCartResponse>("/cart"),
        ]);

        const nextWishlistCount = (wishlistData.items ?? []).length;
        const nextCartCount = Number(cartData.meta?.totalItems ?? (cartData.items ?? []).length);
        if (!isCurrent) return;
        setWishlistCount(nextWishlistCount);
        setCartCount(nextCartCount);
        countsCache = {
          wishlistCount: nextWishlistCount,
          cartCount: nextCartCount,
          updatedAt: Date.now(),
        };
      } catch {
        resetCounts();
      }
    };

    if (!isLoggedIn) {
      countsCache = null;
      resetCounts();
      return;
    }

    const handleCountsUpdated = () => {
      void loadCounts();
    };

    const cacheIsFresh = countsCache && Date.now() - countsCache.updatedAt < COUNTS_CACHE_TTL_MS;
    if (cacheIsFresh && countsCache) {
      const cachedWishlistCount = countsCache.wishlistCount;
      const cachedCartCount = countsCache.cartCount;
      queueMicrotask(() => {
        if (!isCurrent) return;
        setWishlistCount(cachedWishlistCount);
        setCartCount(cachedCartCount);
      });
    } else {
      void loadCounts();
    }
    window.addEventListener("nexus:counts-updated", handleCountsUpdated);
    return () => {
      isCurrent = false;
      window.removeEventListener("nexus:counts-updated", handleCountsUpdated);
    };
  }, [isLoggedIn]);

  return { wishlistCount, cartCount };
}
