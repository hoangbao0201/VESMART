import { ApiClientError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/token";

const DEFAULT_API_URL = "http://localhost:3001/api/v1";

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || DEFAULT_API_URL;
}

export type UploadResult = {
  url: string;
  key?: string;
};

/** Multipart upload to NestJS `/uploads` (R2). */
export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const token = getAccessToken();
  const form = new FormData();
  form.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${getBaseUrl()}/uploads`);
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
          data?: UploadResult;
          error?: { code?: string; details?: unknown };
        };
        if (xhr.status >= 200 && xhr.status < 300 && body.success && body.data?.url) {
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
