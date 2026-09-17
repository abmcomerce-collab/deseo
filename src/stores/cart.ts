"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PoloArt } from "@/db/schema";

export type CartItem = {
  variantId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  units: number;
  priceCents: number;
  arts: PoloArt[];
  kind: "polo" | "pack";
  quantity: number;
  maxStock: number;
};

type CartState = {
  items: CartItem[];
  couponCode: string | null;
  isOpen: boolean;
  lastAdded: string | null;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setCoupon: (code: string | null) => void;
  open: () => void;
  close: () => void;
  syncPrices: (updates: { variantId: string; priceCents: number; maxStock: number }[]) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      couponCode: null,
      isOpen: false,
      lastAdded: null,
      add: (item, quantity = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === item.variantId);
          const items = existing
            ? s.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, ...item, quantity: Math.min(i.quantity + quantity, item.maxStock) }
                  : i,
              )
            : [...s.items, { ...item, quantity: Math.min(quantity, item.maxStock) }];
          return { items, isOpen: true, lastAdded: item.variantId };
        }),
      setQuantity: (variantId, quantity) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.variantId === variantId ? { ...i, quantity: Math.max(0, Math.min(quantity, i.maxStock)) } : i))
            .filter((i) => i.quantity > 0),
        })),
      remove: (variantId) => set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      clear: () => set({ items: [], couponCode: null }),
      setCoupon: (couponCode) => set({ couponCode }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      syncPrices: (updates) =>
        set((s) => ({
          items: s.items
            .map((i) => {
              const u = updates.find((x) => x.variantId === i.variantId);
              return u ? { ...i, priceCents: u.priceCents, maxStock: u.maxStock, quantity: Math.min(i.quantity, u.maxStock) } : i;
            })
            .filter((i) => i.quantity > 0),
        })),
    }),
    {
      name: "deseo-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, couponCode: s.couponCode }),
    },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity * i.priceCents, 0);
