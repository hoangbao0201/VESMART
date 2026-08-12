"use client";

import { useCallback } from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { ApiClientError } from "@/lib/api/client";
import { uploadFile } from "@/lib/api/uploads";
import type { ProductFormValues } from "@/lib/product/product-form-schema";
import { newClientId } from "@/lib/product/variant-matrix";

export function useProductMediaUpload(
  getValues: UseFormGetValues<ProductFormValues>,
  setValue: UseFormSetValue<ProductFormValues>,
) {
  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (!list.length) return;

      const current = getValues("images");
      const jobs = list.map((file, index) => ({
        file,
        clientId: newClientId("img"),
        previewUrl: URL.createObjectURL(file),
        sortOrder: current.length + index,
      }));

      setValue(
        "images",
        [
          ...current,
          ...jobs.map((job) => ({
            clientId: job.clientId,
            imageUrl: job.previewUrl,
            altText: job.file.name,
            sortOrder: job.sortOrder,
            uploading: true,
            progress: 0,
          })),
        ],
        { shouldDirty: true },
      );

      for (const job of jobs) {
        try {
          const result = await uploadFile(job.file, (progress) => {
            const images = getValues("images").map((img) =>
              img.clientId === job.clientId ? { ...img, progress } : img,
            );
            setValue("images", images, { shouldDirty: true });
          });
          URL.revokeObjectURL(job.previewUrl);
          const images = getValues("images").map((img) =>
            img.clientId === job.clientId
              ? {
                  ...img,
                  imageUrl: result.url,
                  uploading: false,
                  progress: 100,
                }
              : img,
          );
          setValue("images", images, { shouldDirty: true, shouldValidate: true });
          if (!getValues("thumbnail")) {
            setValue("thumbnail", result.url, { shouldDirty: true });
          }
        } catch (error) {
          URL.revokeObjectURL(job.previewUrl);
          const images = getValues("images").filter((img) => img.clientId !== job.clientId);
          setValue("images", images, { shouldDirty: true });
          throw error instanceof ApiClientError
            ? error
            : new Error("Upload ảnh thất bại. Có thể dán URL thủ công.");
        }
      }
    },
    [getValues, setValue],
  );

  const addImageUrl = useCallback(
    (url: string) => {
      const trimmed = url.trim();
      if (!trimmed) return;
      const images = getValues("images");
      setValue(
        "images",
        [
          ...images,
          {
            clientId: newClientId("img"),
            imageUrl: trimmed,
            altText: "",
            sortOrder: images.length,
          },
        ],
        { shouldDirty: true, shouldValidate: true },
      );
      if (!getValues("thumbnail")) {
        setValue("thumbnail", trimmed, { shouldDirty: true });
      }
    },
    [getValues, setValue],
  );

  return { addFiles, addImageUrl };
}
