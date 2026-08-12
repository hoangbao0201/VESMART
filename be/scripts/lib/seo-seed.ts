/**
 * Shared helpers for VESMART SEO / forum Prisma seed scripts.
 * Keep CTA + env loading here; content drafts stay in each seed-*.ts
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

export const SITE = 'https://vesmart.vn';
export const ZALO = 'https://zalo.me/0971183153';
export const ADDRESS = '634/24 Trưng Nữ Vương, phường Hòa Thuận Tây, Đà Nẵng';
export const PHONE = '0971183153';
export const FALLBACK_IMAGE_CAT = 'chia-se';

/** Load be/.env into process.env (does not override existing keys). */
export function loadEnvFile(fromDir = path.join(__dirname, '..', '..')) {
  const envPath = path.join(fromDir, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const value = m[2].trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

export function assertNoEmDash(label: string, text: string) {
  if (text.includes('—')) {
    throw new Error(`Em dash found in ${label}`);
  }
}

export function assertDraftNoEmDash(draft: {
  baseSlug?: string;
  title: string;
  summary: string;
  seoTitle: string;
  seoDescription: string;
}) {
  assertNoEmDash('title', draft.title);
  assertNoEmDash('summary', draft.summary);
  assertNoEmDash('seoTitle', draft.seoTitle);
  assertNoEmDash('seoDescription', draft.seoDescription);
}

export type ImageRow = {
  url: string;
  width: number | null;
  height: number | null;
};

export async function urlsFromCategory(
  prisma: PrismaClient,
  slug: string,
): Promise<ImageRow[]> {
  const cat = await prisma.imageCategory.findFirst({
    where: { slug, deleted_at: null },
  });
  if (!cat) return [];
  return prisma.image.findMany({
    where: {
      deleted_at: null,
      category_id: cat.id,
      url: { contains: 'cdn.vesmart.vn' },
    },
    select: { url: true, width: true, height: true },
    orderBy: { id: 'desc' },
  });
}

export function preferLandscape(rows: ImageRow[]): ImageRow[] {
  const landscape = rows.filter(
    (r) => r.width != null && r.height != null && r.width >= r.height,
  );
  return [...landscape, ...rows.filter((r) => !landscape.includes(r))];
}

/** Default repair CTA used across SEO posts. */
export function repairCta(options?: {
  productLabel?: string;
  heading?: string;
}): string {
  const product = options?.productLabel ?? 'máy';
  const heading =
    options?.heading ?? `Sửa ${product} tại VESMART Đà Nẵng`;
  return `
## ${heading}

Nếu đã thử các bước trên mà ${product} vẫn lỗi, mang đến **VESMART** để kiểm tra miễn phí:

- Địa chỉ: ${ADDRESS}
- Điện thoại / Zalo: [${PHONE}](${ZALO})
- Tham khảo [sản phẩm & linh kiện](/products), hỏi trên [diễn đàn](/forum), hoặc đọc thêm [blog](/blog)

*Không mất phí nếu không sửa được. Báo giá trước khi thay linh kiện.*
`.trim();
}
