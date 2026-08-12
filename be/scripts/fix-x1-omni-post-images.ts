/**
 * Re-assign images on X1 OMNI SEO posts: prefer ecovacs-deebot-x1-omni (all orientations).
 */
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
const PRIMARY = 'ecovacs-deebot-x1-omni';
const FALLBACK = 'chia-se';
const BASES = [
  'ecovacs-deebot-x1-omni-tu-chay-ra-khoi-tram',
  'ecovacs-deebot-x1-omni-khong-ve-tram',
  'ecovacs-deebot-x1-omni-khong-ket-noi-wifi',
  'ecovacs-deebot-x1-omni-bat-len-khong-co-am-thanh',
  'ecovacs-deebot-x1-omni-bi-treo',
];

async function urlsFrom(slug: string) {
  const cat = await prisma.imageCategory.findFirst({
    where: { slug, deleted_at: null },
  });
  if (!cat) return [] as string[];
  const rows = await prisma.image.findMany({
    where: {
      deleted_at: null,
      category_id: cat.id,
      url: { contains: 'cdn.vesmart.vn' },
    },
    select: { url: true },
    orderBy: { id: 'desc' },
  });
  return rows.map((r) => r.url);
}

function extractCdn(text: string) {
  return [...new Set(text.match(/https:\/\/cdn\.vesmart\.vn\/[^\s)"']+/g) ?? [])];
}

async function main() {
  const primary = await urlsFrom(PRIMARY);
  const fallback = await urlsFrom(FALLBACK);
  const need = BASES.length * 4;
  const pool: string[] = [];
  if (primary.length === 0) {
    pool.push(...fallback);
  } else {
    for (let i = 0; i < need; i++) {
      pool.push(primary[i % primary.length]);
    }
  }
  console.log(`pool=${pool.length} (x1=${primary.length}, cycle-reuse=${primary.length > 0 && need > primary.length})`);

  for (let i = 0; i < BASES.length; i++) {
    const post = await prisma.post.findFirst({
      where: { deleted_at: null, slug: { startsWith: `${BASES[i]}-` } },
    });
    if (!post) {
      console.log('MISSING', BASES[i]);
      continue;
    }
    const offset = i * 4;
    const news = [
      pool[offset],
      pool[offset + 1],
      pool[offset + 2],
      pool[offset + 3],
    ];
    const olds = extractCdn([post.thumbnail ?? '', post.content].join('\n'));
    let content = post.content;
    for (let j = 0; j < Math.min(olds.length, news.length); j++) {
      content = content.split(olds[j]).join(news[j]);
    }
    await prisma.post.update({
      where: { id: post.id },
      data: { thumbnail: news[0], content },
    });
    const fromX1 = news.filter((u) => u.includes(PRIMARY)).length;
    console.log(`OK #${post.id} x1-imgs-in-slot=${fromX1}/4 thumb=${news[0].slice(-55)}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
