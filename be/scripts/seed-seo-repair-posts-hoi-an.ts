/**
 * Publish 5 SEO posts — robot repair topics for Hội An → VESMART Đà Nẵng.
 *
 * Usage:
 *   pnpm run prisma:seed-seo-repair-hoi-an
 */
import { PostStatus, PrismaClient, UserRole } from '@prisma/client';
import {
  ADDRESS,
  loadEnvFile,
  PHONE,
  SITE,
  ZALO,
} from './lib/seo-seed';

loadEnvFile();

const prisma = new PrismaClient();

type PostDraft = {
  baseSlug: string;
  title: string;
  summary: string;
  seoTitle: string;
  seoDescription: string;
  buildContent: (imgs: { thumb: string; a: string; b: string; c: string }) => string;
};

function ctaHoiAn(): string {
  return `
## Sửa robot hút bụi cho khách Hội An tại VESMART

**VESMART** ở Đà Nẵng (cách Hội An khoảng 25–35 phút xe) nhận sửa robot hút bụi Ecovacs, Roborock, Dreame, Xiaomi và smart home. Nhiều khách tại **Hội An, Duy Xuyên, Điện Bàn** mang máy qua hoặc gửi xe khách — liên hệ trước qua Zalo để được hướng dẫn.

- **Địa chỉ:** ${ADDRESS}
- **Zalo / gọi ngay:** [${PHONE}](${ZALO})
- **Cam kết:** Kiểm tra miễn phí · báo giá trước khi sửa · *không mất phí nếu không sửa được*
- Xem [sản phẩm & phụ kiện](/products) · [diễn đàn hỏi đáp](/forum)
`.trim();
}

const POSTS: PostDraft[] = [
  {
    baseSlug: 'robot-hut-bui-bi-vao-nuoc-hoi-an',
    title: 'Robot hút bụi bị vào nước ở Hội An: xử lý khẩn cấp và sửa ở đâu?',
    summary:
      'Robot hút bụi ngập nước ở Hội An cần tắt máy ngay, không sạc. Hướng dẫn sơ cứu và mang sửa tại VESMART Đà Nẵng — gần Hội An.',
    seoTitle: 'Robot hút bụi bị vào nước Hội An — sửa ở đâu? | VESMART',
    seoDescription:
      'Robot hút bụi ngập nước tại Hội An: tắt nguồn, không sấy nóng, mang VESMART Đà Nẵng sửa mainboard/pin. Tư vấn Zalo 0971183153.',
    buildContent: ({ a, b, c }) => `
Nhà **Hội An** hay ẩm, sàn lau nhiều hoặc robot lau nhà — chỉ cần một lần **robot hút bụi bị vào nước** (ngập nước, lau quá ướt, trẻ đổ nước) là mainboard, pin hoặc motor có thể hỏng vĩnh viễn nếu xử lý sai.

![Robot hút bụi bị vào nước cần sửa chữa tại Hội An Đà Nẵng](${a})

## Làm gì ngay khi robot ngập nước?

1. **Tắt nguồn** — giữ nút nguồn hoặc rút pin (nếu tháo được an toàn)
2. **Không đặt lên dock sạc** — tránh chập điện
3. **Không dùng máy sấy, lò vi sóng, phơi nắng gắt** — nhiệt làm hỏng seal và linh kiện
4. **Lật máy, để ráo tự nhiên** ở nơi thoáng 24–48 giờ (chỉ là bước tạm)
5. **Không tự tháo mainboard** nếu chưa có kinh nghiệm

> ⚠️ Robot không chống nước hoàn toàn. “Chống nước IP” trên lau nhà ≠ ngâm nước được.

## Dấu hiệu sau khi vào nước

- Không bật được / báo lỗi liên tục trên app
- Mùi cháy, khói, nóng bất thường
- LIDAR / quạt không quay
- Pin phồng, rỉ sét chân sạc

![Kiểm tra robot hút bụi sau khi ngập nước tại trung tâm VESMART](${b})

## Vì sao nên mang VESMART thay vì tự sửa?

Tại **Hội An** ít trung tâm chuyên robot. **VESMART Đà Nẵng** (Trưng Nữ Vương) có kinh nghiệm sửa máy ngập nước: làm khô buồng kín, kiểm tra short mainboard, thay pin nếu cell chết, test sạc–xả trước trả máy.

![Sửa chữa robot hút bụi ngập nước — dịch vụ VESMART gần Hội An](${c})

Khách **Hội An** thường mang máy trong ngày, nhận lại 24–48h tùy mức độ ngập.

${ctaHoiAn()}

## FAQ

**Robot vào nước nhẹ, để khô có chạy lại không?**  
Có thể tạm ổn vài ngày rồi lỗi — nên kiểm tra để tránh cháy khi sạc.

**Sửa ngập nước tốn bao nhiêu?**  
Tùy model và mức hỏng (lau sạch vs thay mainboard). VESMART báo giá sau khi mở máy.

**Có nhận gửi xe từ Hội An không?**  
Liên hệ Zalo trước — nhân viên hướng dẫn gửi xe khách hoặc hẹn mang trực tiếp.
`.trim(),
  },
  {
    baseSlug: 'robot-hut-bui-khong-chay-hoi-an',
    title: 'Robot hút bụi không chạy ở Hội An: nguyên nhân và địa chỉ sửa uy tín',
    summary:
      'Robot hút bụi không chạy, bấm nguồn không phản hồi ở Hội An — checklist tại nhà và nơi sửa gần: VESMART Đà Nẵng.',
    seoTitle: 'Robot hút bụi không chạy Hội An — sửa ở đâu? | VESMART',
    seoDescription:
      'Robot không chạy tại Hội An: pin, nút nguồn, mainboard. Mang sửa VESMART Đà Nẵng — kiểm tra miễn phí, Zalo 0971183153.',
    buildContent: ({ a, b, c }) => `
**Robot hút bụi không chạy** — bấm nút im lặng, app không kết nối — là lỗi khách **Hội An** hay gặp sau mùa ẩm, cúp điện hoặc máy va đập.

![Robot hút bụi không chạy cần kiểm tra tại Hội An](${a})

## Phân loại nhanh

| Triệu chứng | Hướng xử lý |
| --- | --- |
| Không lên đèn, không rung | Pin chết / mainboard / nút nguồn |
| Có đèn, không di chuyển | Motor bánh, dị vật kẹt |
| App báo offline | Wi‑Fi hoặc firmware — thử reset trước |
| Vừa ngập nước | **Không sạc** — mang sửa ngay |

## Tự kiểm tra trước khi mang đi

- Sạc trên dock 30 phút, thử bật lại
- Kiểm tra nút nguồn có kẹt, bụi bẩn
- Lật máy: tóc quấn bánh xe, chổi giữa
- Khởi động lại (giữ nguồn 10–15 giây tùy hãng)
- Cập nhật app / reset factory (nếu máy vẫn lên màn hình)

![Tháo kiểm tra bánh xe robot hút bụi không chạy](${b})

## Khi nào cần kỹ thuật viên?

- Không phản hồi sau sạc đủ lâu
- Mùi cháy, pin phồng
- Rơi cầu thang, va mạnh
- Đã thử reset mà vẫn “chết”

**VESMART** đo nguồn, kiểm tra mainboard và motor — báo giá rõ trước khi thay linh kiện. Khách từ **Hội An** chỉ cần di chuyển ngắn sang Đà Nẵng.

![Sửa robot hút bụi không chạy tại VESMART gần Hội An](${c})

${ctaHoiAn()}

## FAQ

**Bảo hành hãng còn, có nên mang VESMART?**  
Nếu hết bảo hành hoặc cần sửa nhanh, VESMART hỗ trợ nhiều hãng phổ biến tại VN.

**Mất bao lâu?**  
Lỗi đơn giản trong ngày; mainboard 1–3 ngày tùy linh kiện.

**Có cho mượn máy thay thế không?**  
Liên hệ Zalo — tùy thời điểm và tồn kho.
`.trim(),
  },
  {
    baseSlug: 'robot-hut-bui-khong-ve-tram-sac-hoi-an',
    title: 'Robot hút bụi không về trạm sạc ở Hội An: cách khắc phục và sửa chuyên nghiệp',
    summary:
      'Robot không về dock, đi lòng vòng ở nhà Hội An — vệ sinh LIDAR, cảm biến, map. Sửa tại VESMART Đà Nẵng nếu vẫn lỗi.',
    seoTitle: 'Robot không về trạm sạc Hội An — khắc phục & sửa | VESMART',
    seoDescription:
      'Robot hút bụi không về trạm sạc tại Hội An: lau LIDAR, căn dock, reset map. Sửa module định vị tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c }) => `
Nhà phố **Hội An** — hẹp, nhiều đồ, thảm — dễ khiến **robot hút bụi không về trạm sạc**: máy chạy hết pin giữa phòng hoặc đứng cách dock vài cm.

![Robot hút bụi không về trạm sạc tại nhà Hội An](${a})

## Nguyên nhân thường gặp

- LIDAR / cảm biến bụi (đặc biệt sau mùa nồm)
- Dock bị dời so với map đã lưu
- Chân sạc oxi hóa — tiếp xúc kém
- Ánh sáng yếu (model dùng camera)
- Lỗi phần mềm / map hỏng sau mất điện

## Xử lý tại nhà (Hội An)

1. Lau nắp LIDAR và mắt cảm biến bằng khăn khô
2. Đặt dock cố định, hai bên trống theo hướng dẫn hãng
3. Lau chân sạc robot và tiếp điểm dock
4. Xóa map cũ → cho robot **map lại từ dock**
5. Thử “gọi về dock” từ app khi pin > 20%

![Vệ sinh cảm biến giúp robot về trạm sạc chính xác](${b})

## Khi cần mang VESMART?

- LIDAR không quay, kêu lạ
- Va tường liên tục dù đã vệ sinh
- App báo lỗi navigation / laser
- Robot về gần dock rồi đứng im (lỗi tiếp xúc hoặc dock)

Kỹ thuật viên **VESMART** kiểm tra module định vị, dock và mainboard — phù hợp khách **Hội An** không muốn mua dock mới nhầm model.

![Sửa lỗi không về trạm sạc robot tại VESMART Đà Nẵng](${c})

${ctaHoiAn()}

## FAQ

**Nhà Hội An nhiều ngưỡng cửa có ảnh hưởng?**  
Có — robot có thể không vượt ngưỡng về dock. Đặt dock ở tầng / khu robot thường chạy.

**Thay dock xịn có hết lỗi không?**  
Chỉ khi dock hỏng thật. Nhiều case chỉ cần vệ sinh hoặc sửa LIDAR.

**VESMART cách Hội An bao xa?**  
Khoảng 25–35 phút ô tô tùy giao thông — nên hẹn Zalo trước.
`.trim(),
  },
  {
    baseSlug: 'robot-hut-bui-khong-hoat-dong-hoi-an',
    title: 'Robot hút bụi không hoạt động ở Hội An: từ A–Z và nơi sửa tin cậy',
    summary:
      'Robot hút bụi không hoạt động (không hút, không lau, không kết nối) ở Hội An — hướng dẫn và VESMART Đà Nẵng nhận sửa tất cả hãng.',
    seoTitle: 'Robot hút bụi không hoạt động Hội An | VESMART sửa chữa',
    seoDescription:
      'Robot không hoạt động tại Hội An: không hút, không di chuyển, app lỗi. Sửa chuyên nghiệp VESMART Đà Nẵng — miễn phí kiểm tra.',
    buildContent: ({ a, b, c }) => `
**Robot hút bụi không hoạt động** là cách khách **Hội An** mô tả chung: máy không hút, không lau, không nhận lệnh app, hoặc “đứng im cả ngày”. Bài viết giúp bạn khoanh vùng lỗi trước khi mang **VESMART** sửa.

![Robot hút bụi không hoạt động tại Hội An cần kiểm tra](${a})

## Robot “không hoạt động” theo từng phần

### Không di chuyển
- Pin yếu / pin chết
- Bánh xe kẹt, motor hỏng
- Lỗi mainboard sau va đập hoặc nước

### Không hút / hút yếu
- Hộp bụi đầy, filter tắc
- Quạt hút mòn
- Gioăng hộp bụi hở

### Không lau / không rút nước (robot lau)
- Bình nước, bơm, ống tắc
- Pad lau bẩn — hay gặp nhà gần biển Hội An

### App không điều khiển được
- Wi‑Fi 2.4GHz, firmware cũ
- Máy treo — thử reset

![Bảo dưỡng robot hút bụi trước khi kết luận hỏng hoàn toàn](${b})

## Checklist 10 phút tại nhà

- [ ] Sạc pin, đèn báo sạc sáng
- [ ] Đổ bụi, rửa filter (để khô)
- [ ] Cắt tóc quấn chổi
- [ ] Thử chạy manual trên app
- [ ] Khởi động lại router + robot

Nếu vẫn **không hoạt động** bất kỳ chức năng nào → mang kiểm tra.

## VESMART — trung tâm sửa gần Hội An

**VESMART** tại Đà Nẵng chuyên robot hút bụi & smart home, phục vụ khách **Hội An, An Bàng, Cẩm Hà, Vinh Điện Nam**. Kiểm tra miễn phí, báo giá minh bạch, bảo hành linh kiện thay thế.

![Trung tâm sửa robot hút bụi VESMART — phục vụ khu vực Hội An](${c})

${ctaHoiAn()}

## FAQ

**Có sửa robot lau nhà kết hợp hút không?**  
Có — bao gồm bơm nước, pad, motor lau.

**Mang máy cần mang dock không?**  
Nên mang nếu lỗi liên quan sạc / về dock.

**Thời gian nhận máy?**  
Thường 8h–18h; nên nhắn Zalo trước để xếp lịch kỹ thuật viên.
`.trim(),
  },
  {
    baseSlug: 'robot-hut-bui-chay-mot-luc-roi-ngung-hoi-an',
    title: 'Robot hút bụi chạy một lúc rồi ngưng ở Hội An: nguyên nhân và cách sửa',
    summary:
      'Robot chạy vài phút rồi tắt, dừng giữa chừng ở Hội An — pin, nhiệt, quạt, cảm biến. Sửa tại VESMART Đà Nẵng.',
    seoTitle: 'Robot chạy một lúc rồi ngưng Hội An — sửa robot | VESMART',
    seoDescription:
      'Robot hút bụi chạy được vài phút rồi dừng tại Hội An: pin chai, quá nhiệt, kẹt chổi. Sửa VESMART Đà Nẵng — Zalo 0971183153.',
    buildContent: ({ a, b, c }) => `
**Robot hút bụi chạy một lúc rồi ngưng** — dừng giữa phòng, tự tắt, hoặc báo lỗi sau 5–15 phút — thường gặp ở nhà **Hội An** có thảm dày, lông thú hoặc pin đã cũ.

![Robot hút bụi chạy một lúc rồi ngưng cần chẩn đoán](${a})

## Nguyên nhân hay gặp

1. **Pin chai** — % pin nhảy, máy tắt đột ngột
2. **Quá nhiệt** — quạt bị bụi, motor làm việc quá sức trên thảm
3. **Chổi / bánh kẹt** — motor bảo vệ, máy dừng
4. **Cảm biến cliff báo nhầm** — sàn bóng, thảm đen
5. **Lỗi mainboard** sau nước / sốc điện

## Thử ngay tại nhà

- Vệ sinh filter, hộp bụi, chổi
- Chạy thử trên **sàn gạch** (loại trừ lỗi thảm)
- Lau cảm biến rơi (cliff) dưới đáy máy
- Để máy nguội 30 phút rồi chạy lại
- Xem app có báo “overheat” / “fan error” / “battery low”

![Kiểm tra pin và quạt khi robot chạy một lúc rồi dừng](${b})

## Khi nào mang VESMART (gần Hội An)?

- Dừng lặp lại dù sàn trơn, máy sạch
- Máy nóng, mùi khét
- Pin sạc đầy nhưng chỉ chạy 10–20 phút
- App báo lỗi fan / battery / motor

Tại **VESMART Đà Nẵng**, kỹ thuật viên test pin thật, quạt và motor — thay đúng linh kiện thay vì đoán mò.

![Sửa robot chạy một lúc rồi ngưng — VESMART phục vụ Hội An](${c})

${ctaHoiAn()}

## FAQ

**Mùa nóng Hội An có làm robot dễ ngưng?**  
Nhiệt môi trường + motor làm việc lâu dễ kích hoạt bảo vệ — nên vệ sinh quạt định kỳ.

**Thay pin có hết ngưng giữa chừng không?**  
Nếu nguyên nhân là pin chai thì có. Nếu do quạt/mainboard cần sửa thêm.

**Chi phí kiểm tra?**  
VESMART kiểm tra miễn phí; chỉ thu khi bạn đồng ý sửa.
`.trim(),
  },
];

async function pickImages(count: number, skip = 0) {
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
    skip,
    take: 200,
  });

  const landscape = rows.filter(
    (r) => r.width != null && r.height != null && r.width >= r.height,
  );
  const pool = (landscape.length >= count ? landscape : rows).map((r) => r.url);
  if (pool.length < count) {
    throw new Error(`Need ${count} images, found ${pool.length} (skip=${skip})`);
  }
  return pool.slice(0, count);
}

async function main() {
  const category = await prisma.postCategory.findFirst({
    where: { slug: 'sua-chua', deleted_at: null },
  });
  if (!category) throw new Error('Post category sua-chua not found');

  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN, deleted_at: null },
    orderBy: { id: 'asc' },
  });
  if (!admin) throw new Error('No ADMIN user found');

  const urls = await pickImages(POSTS.length * 4, 0);
  const created: string[] = [];

  for (let i = 0; i < POSTS.length; i++) {
    const draft = POSTS[i];
    const existing = await prisma.post.findFirst({
      where: {
        deleted_at: null,
        OR: [
          { slug: { startsWith: `${draft.baseSlug}-` } },
          { slug: draft.baseSlug },
        ],
      },
      select: { id: true, slug: true },
    });
    if (existing) {
      console.log(`SKIP exists #${existing.id} ${existing.slug}`);
      created.push(`${SITE}/blog/${existing.slug}`);
      continue;
    }

    const offset = i * 4;
    const imgs = {
      thumb: urls[offset],
      a: urls[offset + 1],
      b: urls[offset + 2],
      c: urls[offset + 3],
    };

    const post = await prisma.post.create({
      data: {
        title: draft.title,
        slug: `${draft.baseSlug}-tmp-${Date.now()}`,
        summary: draft.summary,
        content: draft.buildContent(imgs),
        thumbnail: imgs.thumb,
        seo_title: draft.seoTitle,
        seo_description: draft.seoDescription,
        status: PostStatus.PUBLISHED,
        published_at: new Date(Date.now() - i * 60_000),
        author: { connect: { id: admin.id } },
        category: { connect: { id: category.id } },
      },
    });

    const finalSlug = `${draft.baseSlug}-${post.id}`;
    await prisma.post.update({
      where: { id: post.id },
      data: { slug: finalSlug },
    });

    const url = `${SITE}/blog/${finalSlug}`;
    console.log(`OK #${post.id} ${url}`);
    created.push(url);
  }

  console.log('\nPublished URLs:');
  for (const u of created) console.log(u);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
