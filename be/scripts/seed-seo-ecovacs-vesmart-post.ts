/**
 * Publish 1 SEO post - Ecovacs + VESMART đồng hành ngôi nhà thông minh.
 * Images: Ecovacs (x1-omni, t589) + VESMART/Chia sẽ (chia-se).
 *
 * Usage:
 *   pnpm run prisma:seed-seo-ecovacs-vesmart
 */
import { PostStatus, PrismaClient, UserRole } from '@prisma/client';
import {
  ADDRESS,
  assertNoEmDash,
  loadEnvFile,
  PHONE,
  SITE,
  ZALO,
} from './lib/seo-seed';

loadEnvFile();

const prisma = new PrismaClient();

const ECOVACS_SLUGS = ['ecovacs-deebot-x1-omni', 'ecovacs-deebot-t589'];
const VESMART_SLUG = 'chia-se';

type PostDraft = {
  baseSlug: string;
  title: string;
  summary: string;
  seoTitle: string;
  seoDescription: string;
  buildContent: (imgs: {
    thumb: string;
    a: string;
    b: string;
    c: string;
    d: string;
  }) => string;
};

function cta(): string {
  return `
## Liên hệ VESMART Đà Nẵng

Cần tư vấn chọn **Ecovacs**, bảo dưỡng định kỳ hoặc sửa robot hút bụi thông minh? Đến **VESMART**:

- Địa chỉ: ${ADDRESS}
- Điện thoại / Zalo: [${PHONE}](${ZALO})
- Xem [sản phẩm & phụ kiện](/products), hỏi kinh nghiệm trên [diễn đàn](/forum), hoặc đọc thêm [blog](/blog)

*Kiểm tra miễn phí. Không mất phí nếu không sửa được.*
`.trim();
}

const POST: PostDraft = {
  baseSlug: 'ecovacs-vesmart-dong-hanh-ngoi-nha-thong-minh',
  title:
    'Ecovacs khu vực miền Trung: VESMART đồng hành cùng ngôi nhà thông minh của bạn',
  summary:
    'Ecovacs Deebot giúp nhà sạch tự động; VESMART Đà Nẵng đồng hành tư vấn, bảo dưỡng và sửa chữa robot hút bụi khu vực miền Trung.',
  seoTitle:
    'Ecovacs & VESMART: đồng hành ngôi nhà thông minh miền Trung',
  seoDescription:
    'Robot Ecovacs Deebot cho nhà thông minh. VESMART Đà Nẵng tư vấn, bảo dưỡng, sửa chữa khu vực miền Trung. Liên hệ Zalo 0971183153.',
  buildContent: ({ a, b, c, d }) => `
Ngôi nhà thông minh không chỉ là cảm biến và điều khiển giọng nói. Một **robot hút bụi Ecovacs** chạy đúng lịch, về trạm tự giặt giẻ và sạc đầy mới thực sự giúp bạn bớt việc hàng ngày. Tại **khu vực miền Trung**, **VESMART** đồng hành từ lúc chọn máy đến khi cần bảo dưỡng hay sửa chữa.

![Robot Ecovacs Deebot và không gian nhà thông minh cùng VESMART](${a})

## Vì sao Ecovacs hợp với nhà thông minh?

**Ecovacs Deebot** (từ dòng phổ thông đến **X1 OMNI**, **T589**) kết nối app, lập lịch theo vùng, nhận diện vật cản và tự về trạm. Khi nhà bạn đã có Wi-Fi ổn định, robot trở thành lớp “vệ sinh tự động” trong hệ sinh thái nhà thông minh.

Điểm người dùng miền Trung hay quan tâm:

- Nhà phố / căn hộ nhiều gạch men và thảm nhỏ
- Độ ẩm cao, bụi mịn, lông thú cưng
- Cần máy vừa hút vừa lau, ít can thiệp tay
- Muốn có chỗ sửa gần, không phải gửi xa khi hết bảo hành

![Ecovacs Deebot làm sạch sàn nhà hiện đại](${b})

## VESMART đồng hành cùng bạn thế nào?

**VESMART** tại Đà Nẵng phục vụ khách khu vực miền Trung quanh robot hút bụi và thiết bị nhà thông minh liên quan:

1. **Tư vấn chọn dòng Ecovacs** phù hợp diện tích, sàn và ngân sách
2. **Hướng dẫn dùng app, map, lịch chạy** để máy “sống” đúng nhịp nhà bạn
3. **Bảo dưỡng định kỳ**: filter, chổi, cảm biến, trạm sạc / OMNI
4. **Sửa chữa chuyên sâu** khi lỗi phần cứng, pin, mainboard, trạm

Bạn không cần tự mày mò hết forum khi máy báo lỗi. Mang máy tới cửa hàng hoặc nhắn Zalo để được hướng dẫn nhanh.

![Đội ngũ VESMART hỗ trợ Ecovacs và ngôi nhà thông minh](${c})

## Checklist giữ Ecovacs khỏe quanh năm

- Làm sạch filter và hộp bụi đúng chu kỳ hãng
- Lau LIDAR / cảm biến tường, chân sạc, bánh xe
- Đặt trạm sát tường, hai bên trống, không kê thảm dày
- Cập nhật firmware qua app Ecovacs Home
- Không để robot chạy khi dây điện / đồ chơi nhỏ còn trên sàn

Khi máy hút yếu, lệch map, không về trạm hoặc báo lỗi lặp lại, đừng chờ tới lúc hỏng nặng. Kiểm tra sớm giúp tiết kiệm linh kiện và thời gian.

![Bảo dưỡng robot Ecovacs tại VESMART Đà Nẵng miền Trung](${d})

## Ai nên đọc bài này?

- Gia đình đang dùng hoặc sắp mua **Ecovacs Deebot** tại Đà Nẵng, Hội An và lân cận
- Người muốn nhà sạch tự động nhưng vẫn cần chỗ **sửa gần, rõ ràng**
- Ai đang dựng ngôi nhà thông minh và cần “mắt xích” vệ sinh sàn đáng tin

${cta()}

## FAQ

**VESMART có bán Ecovacs chính hãng không?**  
Cửa hàng hỗ trợ tư vấn, phụ kiện và sửa chữa. Nhu cầu mua máy hoặc linh kiện cụ thể, liên hệ Zalo để được báo tình trạng tồn và lựa chọn phù hợp.

**Ở xa Đà Nẵng có gửi máy sửa được không?**  
Có. Nhiều khách miền Trung gửi máy kèm mô tả lỗi. VESMART báo phí kiểm tra / sửa trước khi thay linh kiện.

**X1 OMNI và T589 khác nhau chỗ nào?**  
X1 OMNI nghiêng về trạm tự động mạnh (giặt giẻ, đổ rác tùy cấu hình). T589 thuộc phân khúc dễ tiếp cận hơn. VESMART giúp bạn chọn theo diện tích và thói quen dùng.

**Có mất phí nếu không sửa được?**  
Không. Chính sách kiểm tra miễn phí; không sửa được thì không thu phí sửa.
`.trim(),
};

async function urlsFromCategory(slug: string) {
  const cat = await prisma.imageCategory.findFirst({
    where: { slug, deleted_at: null },
  });
  if (!cat) return [] as { url: string; width: number | null; height: number | null }[];
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

async function pickImages() {
  const ecovacsRows = (
    await Promise.all(ECOVACS_SLUGS.map((s) => urlsFromCategory(s)))
  ).flat();
  const vesmartRows = await urlsFromCategory(VESMART_SLUG);

  if (ecovacsRows.length < 3) {
    throw new Error(
      `Need >=3 Ecovacs images from ${ECOVACS_SLUGS.join(',')}, got ${ecovacsRows.length}`,
    );
  }
  if (vesmartRows.length < 2) {
    throw new Error(
      `Need >=2 VESMART images from ${VESMART_SLUG}, got ${vesmartRows.length}`,
    );
  }

  const landscapeEco = ecovacsRows.filter(
    (r) => r.width != null && r.height != null && r.width >= r.height,
  );
  const ecoPool = [...(landscapeEco.length >= 3 ? landscapeEco : ecovacsRows)];
  const seen = new Set<string>();
  const takeDistinct = (
    rows: { url: string }[],
    n: number,
  ): string[] => {
    const out: string[] = [];
    for (const r of rows) {
      if (seen.has(r.url)) continue;
      seen.add(r.url);
      out.push(r.url);
      if (out.length >= n) break;
    }
    return out;
  };

  const ecoUrls = takeDistinct(ecoPool, 3);
  if (ecoUrls.length < 3) {
    for (const r of ecovacsRows) {
      if (seen.has(r.url)) continue;
      seen.add(r.url);
      ecoUrls.push(r.url);
      if (ecoUrls.length >= 3) break;
    }
  }
  const vesmartUrls = takeDistinct(vesmartRows, 2);
  if (ecoUrls.length < 3 || vesmartUrls.length < 2) {
    throw new Error(
      `Distinct images short: eco=${ecoUrls.length} vesmart=${vesmartUrls.length}`,
    );
  }

  const imgs = {
    thumb: ecoUrls[0],
    a: ecoUrls[1],
    b: ecoUrls[2],
    c: vesmartUrls[0],
    d: vesmartUrls[1],
  };

  console.log(
    `Images: ecovacs=${ecovacsRows.length}, vesmart=${vesmartRows.length}`,
  );
  console.log('URLs:', Object.values(imgs));
  return imgs;
}

async function main() {
  assertNoEmDash('title', POST.title);
  assertNoEmDash('summary', POST.summary);
  assertNoEmDash('seoTitle', POST.seoTitle);
  assertNoEmDash('seoDescription', POST.seoDescription);

  const category = await prisma.postCategory.findFirst({
    where: { slug: 'huong-dan', deleted_at: null },
  });
  if (!category) throw new Error('Post category huong-dan not found');

  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN, deleted_at: null },
    orderBy: { id: 'asc' },
  });
  if (!admin) throw new Error('No ADMIN user found');

  const existing = await prisma.post.findFirst({
    where: {
      deleted_at: null,
      OR: [
        { slug: { startsWith: `${POST.baseSlug}-` } },
        { slug: POST.baseSlug },
      ],
    },
    select: { id: true, slug: true },
  });
  if (existing) {
    console.log(`SKIP exists #${existing.id} ${existing.slug}`);
    console.log(`${SITE}/blog/${existing.slug}`);
    return;
  }

  const imgs = await pickImages();
  const content = POST.buildContent(imgs);
  assertNoEmDash('content', content);

  const post = await prisma.post.create({
    data: {
      title: POST.title,
      slug: `${POST.baseSlug}-tmp-${Date.now()}`,
      summary: POST.summary,
      content,
      thumbnail: imgs.thumb,
      seo_title: POST.seoTitle,
      seo_description: POST.seoDescription,
      status: PostStatus.PUBLISHED,
      published_at: new Date(),
      author: { connect: { id: admin.id } },
      category: { connect: { id: category.id } },
    },
  });

  const finalSlug = `${POST.baseSlug}-${post.id}`;
  await prisma.post.update({
    where: { id: post.id },
    data: { slug: finalSlug },
  });

  const url = `${SITE}/blog/${finalSlug}`;
  console.log(`OK #${post.id} ${url}`);
  console.log('\nPublished URL:');
  console.log(url);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
