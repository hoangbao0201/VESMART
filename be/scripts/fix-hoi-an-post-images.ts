/** One-shot: fix images on Hoi An SEO posts — use robot category only. */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

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
const HOI_AN_SLUGS = [
  'robot-hut-bui-bi-vao-nuoc-hoi-an',
  'robot-hut-bui-khong-chay-hoi-an',
  'robot-hut-bui-khong-ve-tram-sac-hoi-an',
  'robot-hut-bui-khong-hoat-dong-hoi-an',
  'robot-hut-bui-chay-mot-luc-roi-ngung-hoi-an',
];

async function pickRobotImages(count: number) {
  const cat = await prisma.imageCategory.findFirst({
    where: { slug: 'robot-hut-bui-chia-se', deleted_at: null },
  });
  if (!cat) throw new Error('Category robot-hut-bui-chia-se not found');

  const rows = await prisma.image.findMany({
    where: {
      deleted_at: null,
      category_id: cat.id,
      url: { contains: 'cdn.vesmart.vn' },
    },
    select: { id: true, url: true, width: true, height: true },
    orderBy: { id: 'desc' },
    take: 200,
  });

  const landscape = rows.filter(
    (r) => r.width != null && r.height != null && r.width >= r.height,
  );
  const pool = (landscape.length >= count ? landscape : rows).map((r) => r.url);
  if (pool.length < count) {
    throw new Error(`Need ${count} robot images, found ${pool.length}`);
  }
  return pool.slice(0, count);
}

function replaceCdnUrls(content: string, oldUrls: string[], newUrls: string[]): string {
  let out = content;
  for (let i = 0; i < oldUrls.length; i++) {
    if (oldUrls[i] && newUrls[i]) {
      out = out.split(oldUrls[i]).join(newUrls[i]);
    }
  }
  return out;
}

function extractCdnUrls(text: string): string[] {
  const re = /https:\/\/cdn\.vesmart\.vn\/[^\s)"']+/g;
  return [...new Set(text.match(re) ?? [])];
}

async function main() {
  const robotUrls = await pickRobotImages(HOI_AN_SLUGS.length * 4);
  console.log(`Picked ${robotUrls.length} robot images`);

  for (let i = 0; i < HOI_AN_SLUGS.length; i++) {
    const base = HOI_AN_SLUGS[i];
    const post = await prisma.post.findFirst({
      where: {
        deleted_at: null,
        slug: { startsWith: `${base}-` },
      },
    });
    if (!post) {
      console.log(`MISSING ${base}`);
      continue;
    }

    const offset = i * 4;
    const newThumb = robotUrls[offset];
    const newInline = [
      robotUrls[offset + 1],
      robotUrls[offset + 2],
      robotUrls[offset + 3],
    ];
    const oldUrls = extractCdnUrls(
      [post.thumbnail ?? '', post.content].join('\n'),
    );
    const newUrls = [newThumb, ...newInline];
    let content = post.content;
    for (let j = 0; j < Math.min(oldUrls.length, newUrls.length); j++) {
      content = content.split(oldUrls[j]).join(newUrls[j]);
    }

    await prisma.post.update({
      where: { id: post.id },
      data: {
        thumbnail: newThumb,
        content,
      },
    });

    console.log(`OK #${post.id} ${post.slug}`);
    console.log(`  thumb: ${newThumb.slice(-60)}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
