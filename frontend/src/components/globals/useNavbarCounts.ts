import { useEffect, useState } from "react";
import api from "../../services/api";
import type { NavbarCartResponse } from "./globals.types";

export function useNavbarCounts(isLoggedIn: boolean, currentPath: string) {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
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

        setWishlistCount((wishlistData.items ?? []).length);
        setCartCount(Number(cartData.meta?.totalItems ?? (cartData.items ?? []).length));
      } catch {
        resetCounts();
      }
    };

    if (!isLoggedIn) {
      resetCounts();
      return;
    }

    const handleCountsUpdated = () => {
      void loadCounts();
    };

    void loadCounts();
    window.addEventListener("nexus:counts-updated", handleCountsUpdated);
    return () => {
      window.removeEventListener("nexus:counts-updated", handleCountsUpdated);
    };
  }, [currentPath, isLoggedIn]);

  return { wishlistCount, cartCount };
}
