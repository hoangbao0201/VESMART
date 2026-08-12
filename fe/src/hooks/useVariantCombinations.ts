"use client";

import { useCallback } from "react";
import type { UseFormSetValue, UseFormGetValues } from "react-hook-form";
import type { ProductFormValues } from "@/lib/product/product-form-schema";
import { generateVariantCombinations, newClientId } from "@/lib/product/variant-matrix";

export function useVariantCombinations(
  getValues: UseFormGetValues<ProductFormValues>,
  setValue: UseFormSetValue<ProductFormValues>,
) {
  const generate = useCallback(() => {
    const axes = getValues("attributeAxes");
    const baseSku = getValues("sku") || "SKU";
    const combos = generateVariantCombinations(axes);
    const existing = getValues("variants");

    const next = combos.map((combo, index) => {
      const match = existing.find(
        (v) =>
          (v.attributeLabels ?? []).join("|").toLowerCase() ===
          combo.values
            .map((x) => x.value)
            .join("|")
            .toLowerCase(),
      );
      if (match) return match;
      return {
        clientId: newClientId("var"),
        sku: `${baseSku}-${index + 1}`.toUpperCase().replace(/\s+/g, "-"),
        barcode: "",
        name: combo.name,
        price: 0,
        salePrice: undefined,
        stock: 0,
        weight: undefined,
        status: "ACTIVE" as const,
        image: "",
        attributeValueIds: [],
        attributeLabels: combo.values.map((v) => v.value),
      };
    });

    setValue("variants", next, { shouldDirty: true, shouldValidate: true });
    return next.length;
  }, [getValues, setValue]);

  return { generate };
}
