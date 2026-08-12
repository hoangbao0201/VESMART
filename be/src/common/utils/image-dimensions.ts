import { imageSize } from 'image-size';

export type ImageDimensions = {
  width: number | null;
  height: number | null;
};

/** Read width/height from an image buffer (JPEG/PNG/WebP/GIF). */
export function getImageDimensions(buffer: Buffer): ImageDimensions {
  try {
    const result = imageSize(buffer);
    return {
      width: result.width ?? null,
      height: result.height ?? null,
    };
  } catch {
    return { width: null, height: null };
  }
}
