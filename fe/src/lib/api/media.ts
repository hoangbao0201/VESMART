import {
  apiDelete,
  apiGet,
  apiGetPageSafe,
  apiGetSafe,
  apiPost,
  ApiClientError,
} from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/token";
import type { PaginatedData } from "@/types/api";
import type { MediaImage, MediaImageCategory } from "@/types/media";

const DEFAULT_API_URL = "http://localhost:3001/api/v1";

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || DEFAULT_API_URL;
}

export type ListMediaImagesParams = {
  page?: number;
  limit?: number;
  categoryId?: number;
  q?: string;
};

export async function listMediaImagesPage(
  params: ListMediaImagesParams = {},
): Promise<PaginatedData<MediaImage>> {
  return apiGetPageSafe<MediaImage>("/images", {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 48,
      categoryId: params.categoryId,
      q: params.q,
      sort: "created_at:desc",
    },
    emptyPage: params.page ?? 1,
    emptyLimit: params.limit ?? 48,
    revalidate: 60,
  });
}

/** Fresh list for admin (no cache). Throws on API error. */
export async function listMediaImagesAdmin(
  params: ListMediaImagesParams = {},
): Promise<PaginatedData<MediaImage>> {
  return apiGet<PaginatedData<MediaImage>>("/images", {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 40,
      categoryId: params.categoryId,
      q: params.q,
      sort: "created_at:desc",
    },
    revalidate: false,
  });
}

export async function listMediaCategoryTree(): Promise<MediaImageCategory[]> {
  const data = await apiGetSafe<MediaImageCategory[]>("/images/categories/tree", {
    revalidate: 120,
  });
  return data ?? [];
}

/** Fresh category tree for admin. */
export async function listMediaCategoryTreeAdmin(): Promise<MediaImageCategory[]> {
  const data = await apiGetSafe<MediaImageCategory[]>("/images/categories/tree", {
    revalidate: false,
  });
  return data ?? [];
}

export async function getMediaImage(id: number): Promise<MediaImage | null> {
  try {
    return await apiGet<MediaImage>(`/images/${id}`, { revalidate: 60 });
  } catch {
    return null;
  }
}

export async function createMediaCategory(input: {
  name: string;
  slug?: string;
  parentId?: number;
  sortOrder?: number;
}): Promise<MediaImageCategory> {
  return apiPost<MediaImageCategory>("/images/categories", {
    auth: true,
    body: input,
  });
}

export async function deleteMediaCategory(id: number): Promise<null> {
  return apiDelete<null>(`/images/categories/${id}`, { auth: true });
}

export async function deleteMediaImage(id: number): Promise<null> {
  return apiDelete<null>(`/images/${id}`, { auth: true });
}

export type UploadMediaImageInput = {
  file: File;
  categoryId: number;
  description?: string;
};

/** Multipart upload → `POST /images` (creates Image row + R2). */
export async function uploadMediaImage(
  input: UploadMediaImageInput,
  onProgress?: (percent: number) => void,
): Promise<MediaImage> {
  const token = getAccessToken();
  const form = new FormData();
  form.append("file", input.file);
  form.append("categoryId", String(input.categoryId));
  if (input.description?.trim()) {
    form.append("description", input.description.trim());
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${getBaseUrl()}/images`);
    xhr.setRequestHeader("Accept", "application/json");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText) as {
          success?: boolean;
          message?: string;
          data?: MediaImage;
          error?: { code?: string; details?: unknown };
        };
        if (xhr.status >= 200 && xhr.status < 300 && body.success && body.data) {
          resolve(body.data);
          return;
        }
        reject(
          new ApiClientError(body.message ?? `Upload failed (${xhr.status})`, {
            status: xhr.status,
            code: body.error?.code ?? "UPLOAD_FAILED",
            details: body.error?.details ?? null,
          }),
        );
      } catch {
        reject(
          new ApiClientError("Invalid upload response", {
            status: xhr.status,
            code: "INVALID_RESPONSE",
          }),
        );
      }
    };

    xhr.onerror = () => {
      reject(
        new ApiClientError("Network error during upload", {
          status: 0,
          code: "NETWORK_ERROR",
        }),
      );
    };

    xhr.send(form);
  });
}
