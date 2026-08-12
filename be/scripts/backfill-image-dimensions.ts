/**
 * Backfill width/height for existing Image rows by fetching URL (or R2).
 *
 * Usage:
 *   pnpm run prisma:backfill-image-dims
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { getImageDimensions } from '../src/common/utils/image-dimensions';

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const value = m[2].trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const prisma = new PrismaClient();
const CONCURRENCY = 8;

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'VESMART-ImageDimBackfill/1.0' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function processOne(id: number, url: string) {
  const buffer = await fetchBuffer(url);
  const { width, height } = getImageDimensions(buffer);
  if (width == null || height == null) {
    throw new Error(`Could not read dimensions (${buffer.length} bytes)`);
  }
  await prisma.image.update({
    where: { id },
    data: { width, height },
  });
  return { id, width, height };
}

async function main() {
  const missing = await prisma.image.findMany({
    where: {
      deleted_at: null,
      OR: [{ width: null }, { height: null }],
    },
    select: { id: true, url: true },
    orderBy: { id: 'asc' },
  });

  console.log(`Found ${missing.length} images missing dimensions`);
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < missing.length; i += CONCURRENCY) {
    const batch = missing.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map((row) => processOne(row.id, row.url)),
    );
    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const row = batch[j];
      if (result.status === 'fulfilled') {
        ok += 1;
        console.log(
          `OK #${result.value.id} ${result.value.width}x${result.value.height}`,
        );
      } else {
        fail += 1;
        const msg =
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason);
        console.error(`FAIL #${row.id} ${row.url} — ${msg}`);
      }
    }
  }

  console.log(`Done. ok=${ok} fail=${fail}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
