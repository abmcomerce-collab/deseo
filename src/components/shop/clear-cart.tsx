"use client";

import { useEffect } from "react";
import { useCart } from "@/stores/cart";

export function ClearCart() {
  useEffect(() => {
    useCart.getState().clear();
  }, []);
  return null;
}
