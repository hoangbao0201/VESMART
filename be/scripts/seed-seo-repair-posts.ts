/**
 * One-shot: publish 5 SEO posts about robot vacuum repair.
 * Images from Image catalog (CDN). Category: sua-chua.
 *
 * Usage:
 *   pnpm run prisma:seed-seo-repair-posts
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
  /** Build markdown with assigned CDN URLs */
  buildContent: (imgs: { thumb: string; a: string; b: string; c: string }) => string;
};

function ctaBlock(): string {
  return `
## Liên hệ sửa chữa tại VESMART Đà Nẵng

Nếu đã thử các bước trên mà máy vẫn lỗi, mang robot đến **VESMART** để kiểm tra miễn phí:

- Địa chỉ: ${ADDRESS}
- Điện thoại / Zalo: [${PHONE}](${ZALO})
- Xem thêm [sản phẩm & linh kiện](/products) hoặc hỏi trên [diễn đàn](/forum)

*Không mất phí nếu không sửa được.*
`.trim();
}

const POSTS: PostDraft[] = [
  {
    baseSlug: 'robot-hut-bui-khong-sac-duoc',
    title: 'Robot hút bụi không sạc được: nguyên nhân và cách xử lý',
    summary:
      'Robot hút bụi không sạc được thường do dock, chân sạc bẩn hoặc pin. Hướng dẫn tự kiểm tra và khi nào mang sửa tại VESMART Đà Nẵng.',
    seoTitle: 'Robot hút bụi không sạc được — nguyên nhân & cách sửa | VESMART',
    seoDescription:
      'Checklist sửa robot hút bụi không sạc được: kiểm tra dock, chân sạc, adapter, pin. Tư vấn sửa tại Đà Nẵng — VESMART.',
    buildContent: ({ a, b, c }) => `
Robot hút bụi **không sạc được** hoặc báo lỗi sạc là sự cố rất phổ biến với Ecovacs, Roborock, Dreame, Xiaomi… Bài viết giúp bạn tự loại trừ lỗi cơ bản trước khi mang máy đi sửa tại Đà Nẵng.

![Robot hút bụi và dock sạc cần kiểm tra khi không sạc được](${a})

## Dấu hiệu robot không sạc được

- Đặt lên dock nhưng không thấy đèn sạc / app không báo “đang sạc”
- Pin tụt nhanh dù vừa “sạc xong”
- Máy kêu bip liên tục hoặc báo lỗi contact / charging
- Dock nóng bất thường hoặc có mùi khét

## Checklist tự kiểm tra tại nhà

### 1. Dock và nguồn điện

- Rút–cắm lại adapter, thử ổ điện khác
- Kiểm tra dây nguồn dock bị đứt, lỏng, cháy
- Đảm bảo robot **căn đúng vị trí** trên đế (hai chân kim loại khớp nhau)

### 2. Chân sạc bị bẩn / oxi hóa

Lau sạch **chân sạc trên robot** và **tiếp điểm trên dock** bằng khăn khô hoặc hơi ẩm (không xịt nước trực tiếp). Bụi ẩm lâu ngày rất dễ làm mất tiếp xúc.

![Vệ sinh chân sạc robot hút bụi để khắc phục lỗi không sạc](${b})

### 3. Pin và phần mềm

- Khởi động lại robot / cập nhật firmware qua app hãng
- Nếu pin dưới 5% lâu ngày: để trên dock 30–60 phút rồi thử lại
- Pin chai sau 2–3 năm dùng: máy “sạc đầy” nhưng chạy rất ngắn → cân nhắc thay pin tại trung tâm chuyên sửa

### 4. Khi nào nên mang đi sửa?

- Đã lau chân sạc, đổi ổ điện mà vẫn không vào sạc
- Dock / board sạc có cháy, phù, cong chân
- Robot nóng bất thường khi sạc
- Báo lỗi pin / mainboard trên app

![Kỹ thuật viên kiểm tra lỗi sạc robot hút bụi tại VESMART](${c})

## Chi phí & quy trình tại VESMART

Tại **VESMART Đà Nẵng**, kỹ thuật viên đo nguồn dock, kiểm tra tiếp điểm và pin thật bằng dụng cụ — báo giá trước khi sửa. Nhiều trường hợp chỉ cần làm sạch / thay dock, không phải thay cả máy.

${ctaBlock()}

## FAQ

**Robot có đèn dock sáng nhưng app không báo sạc?**  
Thường do tiếp điểm bẩn hoặc robot chưa khớp đế. Lau chân sạc và đặt lại cho đến khi nghe tiếng “cạch”.

**Sạc qua đêm vẫn 0%?**  
Có thể hỏng mạch sạc hoặc pin chết. Nên mang kiểm tra, tránh tự tháo pin lithium nếu không có kinh nghiệm.

**Có sửa được mọi hãng không?**  
VESMART nhận Ecovacs, Roborock, Dreame, Xiaomi và nhiều dòng robot phổ biến tại Việt Nam.
`.trim(),
  },
  {
    baseSlug: 'robot-hut-bui-luc-hut-yeu',
    title: 'Robot hút bụi lực hút yếu: vệ sinh linh kiện hay phải sửa?',
    summary:
      'Robot hút bụi không hút sạch thường do filter tắc, chổi bẩn hoặc quạt hỏng. Phân biệt tự bảo dưỡng và khi cần sửa tại Đà Nẵng.',
    seoTitle: 'Robot hút bụi lực hút yếu — nguyên nhân & cách khắc phục | VESMART',
    seoDescription:
      'Hướng dẫn xử lý robot hút bụi lực hút yếu: filter, hộp bụi, chổi, quạt. Khi nào mang sửa tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c }) => `
Khi **robot hút bụi lực hút yếu** hoặc “chạy rồi mà sàn vẫn bẩn”, đa số trường hợp đến từ bảo dưỡng — nhưng cũng có lúc quạt / gasket / mainboard cần sửa chuyên nghiệp.

![Robot hút bụi lực hút yếu cần kiểm tra hộp bụi và filter](${a})

## Nguyên nhân thường gặp

1. **Hộp bụi đầy** hoặc lắp không khít
2. **Filter HEPA / màng lọc** bẩn, ẩm mốc
3. **Chổi giữa / chổi cạnh** quấn tóc, giảm đẩy rác vào họng hút
4. **Ống hút / đường gió** tắc dị vật
5. **Quạt hút (fan)** yếu, kêu to, mòn bạc đạn
6. Gioăng (gasket) hộp bụi hở → mất kín khí

## Việc nên làm trước khi mang đi sửa

### Vệ sinh đúng thứ tự

- Đổ hộp bụi sau mỗi 1–2 lần chạy (nhà nhiều lông thú: mỗi lần)
- Rửa filter nếu loại cho phép — **phải để khô hoàn toàn** mới lắp lại
- Cắt tóc quấn chổi, kiểm tra bánh xe có kẹt không

![Vệ sinh filter và chổi robot hút bụi để lấy lại lực hút](${b})

### Kiểm tra nhanh sau vệ sinh

Chạy chế độ mạnh (Max / Power) trên sàn cứng vài phút. Nếu lực hút gần như không đổi so với lúc bẩn → nghi quạt hoặc đường gió bên trong.

## Khi nào cần kỹ thuật viên?

- Quạt kêu rít, mùi cháy
- Lực hút mất đột ngột sau va đập / ngập nước
- App báo lỗi fan / airflow
- Đã thay filter zin mà vẫn yếu

![Sửa quạt hút và linh kiện robot tại trung tâm VESMART Đà Nẵng](${c})

Tại VESMART, chúng tôi đo lực hút, kiểm tra quạt và gioăng — thay linh kiện đúng model để tránh mua nhầm filter “rẻ” làm máy yếu hơn.

Xem thêm [sản phẩm robot / phụ kiện](/products) hoặc trao đổi kinh nghiệm trên [diễn đàn](/forum).

${ctaBlock()}

## FAQ

**Filter rửa được bao lâu một lần?**  
Tùy hãng: thường 2–4 tuần. Filter ướt lắp lại sẽ làm yếu hút và hỏng quạt.

**Dùng túi nilon / filter không chính hãng được không?**  
Dễ hở khí, máy kêu to và hút kém. Nên dùng đúng mã.

**Nhà nhiều lông chó mèo có cách nào?**  
Đổ bụi thường xuyên hơn, chải chổi cạnh, cân nhắc lịch bảo dưỡng định kỳ tại VESMART.
`.trim(),
  },
  {
    baseSlug: 'robot-hut-bui-keu-to-bat-thuong',
    title: 'Robot hút bụi kêu to bất thường: dấu hiệu hỏng và cách xử lý',
    summary:
      'Robot hút bụi kêu to, rít hoặc va đập liên tục có thể do chổi, bánh xe hoặc ổ bi quạt. Hướng dẫn nhận biết và sửa tại Đà Nẵng.',
    seoTitle: 'Robot hút bụi kêu to — nguyên nhân & khi nào cần sửa | VESMART',
    seoDescription:
      'Robot hút bụi kêu to, rít, leng keng: kiểm tra chổi, bánh xe, quạt. Tư vấn sửa chữa tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c }) => `
**Robot hút bụi kêu to** hơn bình thường không chỉ khó chịu — đó thường là tín hiệu linh kiện mòn hoặc dị vật. Xử lý sớm tránh cháy motor.

![Robot hút bụi phát tiếng ồn bất thường khi vận hành](${a})

## Phân loại tiếng ồn

| Kiểu tiếng | Gợi ý nguyên nhân |
| --- | --- |
| Rít cao khi hút mạnh | Quạt / bạc đạn quạt |
| Cạch–cạch theo vòng chổi | Tóc, mảnh cứng trong chổi giữa |
| Leng keng khi rẽ | Bánh xe lệch, ổ bi bánh |
| Va đập liên tục vào chân tường | Cảm biến / LIDAR bẩn (xem thêm bài mất định vị) |

## Tự xử lý an toàn

1. Tắt máy, lật robot, **tháo chổi giữa** — cắt sạch tóc, kiểm tra ổ trục
2. Lấy dị vật ở bánh xe và chổi cạnh
3. Đổ bụi, kiểm tra filter khô
4. Chạy thử trên sàn cứng (không thảm dày) để nghe rõ nguồn tiếng

![Tháo chổi giữa kiểm tra dị vật khi robot hút bụi kêu to](${b})

## Không nên tự làm

- Không bôi mỡ tùy tiện vào motor
- Không tháo quạt nếu không có tool và linh kiện đúng model
- Không tiếp tục chạy khi có mùi cháy

![Bảo dưỡng bánh xe và motor robot hút bụi tại VESMART](${c})

## Sửa tại VESMART Đà Nẵng

Kỹ thuật viên tách nguồn ồn (chổi / bánh / quạt), báo giá thay thế trước. Nhiều case chỉ cần làm sạch + thay bạc đạn bánh, chi phí thấp hơn thay cả cụm.

${ctaBlock()}

## FAQ

**Robot mới mua đã ồn?**  
Thảm dày và chế độ Max vốn ồn hơn. So với video review cùng model; nếu lệch rõ → bảo hành / kiểm tra.

**Kêu to rồi giảm lực hút?**  
Hay gặp khi quạt mòn hoặc filter tắc nặng — nên kiểm tra cả hai.

**Có bảo hành linh kiện thay thế không?**  
VESMART báo rõ thời hạn bảo hành từng hạng mục khi bạn đồng ý sửa.
`.trim(),
  },
  {
    baseSlug: 'robot-hut-bui-khong-ve-dock-mat-dinh-vi',
    title: 'Robot hút bụi không về dock / mất định vị: nguyên nhân và cách khắc phục',
    summary:
      'Robot không tìm thấy dock hoặc đi lòng vòng thường do cảm biến, LIDAR bẩn hoặc map lỗi. Hướng dẫn reset và sửa tại Đà Nẵng.',
    seoTitle: 'Robot không về dock / mất định vị — cách xử lý | VESMART',
    seoDescription:
      'Khắc phục robot hút bụi không về dock, mất map, đi lòng vòng: vệ sinh LIDAR, cảm biến, reset map. Sửa tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c }) => `
**Robot hút bụi không về dock**, mất map hoặc chạy lòng vòng là lỗi định vị / cảm biến rất hay gặp sau vài tháng dùng nhà bụi, nhà nuôi thú.

![Robot hút bụi không tìm thấy dock sạc do lỗi định vị](${a})

## Nguyên nhân phổ biến

- **LIDAR / camera** dính bụi, film bảo vệ, vết tay
- Cảm biến tường / cliff bị bẩn → robot “sợ” hoặc va loạn
- Dock bị **dời chỗ** so với map cũ
- Ánh sáng quá tối / gương kính gây nhiễu (một số model camera)
- Firmware lỗi hoặc map hỏng sau mất điện đột ngột

## Cách xử lý từng bước

### 1. Vệ sinh cảm biến

Lau nhẹ nắp LIDAR, mắt cảm biến quanh thân bằng khăn microfiber khô. Không dùng dung môi mạnh.

![Vệ sinh cảm biến LIDAR giúp robot về dock chính xác](${b})

### 2. Dock và không gian quanh đế

- Để dock sát tường, hai bên trống theo khuyến cáo hãng (thường ≥ 0.5 m)
- Không để dây điện, cân, ghế chắn mặt dock
- Tránh di chuyển dock sau khi đã lưu map

### 3. Reset map / cập nhật app

Nếu robot vẫn không về: xóa map cũ, để máy **tự map lại** từ dock. Cập nhật firmware trước khi map.

### 4. Khi cần mang sửa

- LIDAR không quay / kêu lạ
- App báo lỗi laser / navigation liên tục
- Va đập mạnh sau khi rơi cầu thang
- Mainboard định vị lỗi

![Kiểm tra module định vị robot hút bụi tại VESMART](${c})

Tham khảo thêm các bài sửa chữa khác trên [blog VESMART](/blog) hoặc hỏi nhanh trên [diễn đàn](/forum).

${ctaBlock()}

## FAQ

**Robot về gần dock rồi đứng?**  
Chân sạc bẩn hoặc đế lệch — lau tiếp điểm và căn lại vị trí.

**Có nên dùng mat chống trượt dưới dock?**  
Được, miễn là không nâng dock quá cao so với sàn và không che cảm biến.

**Mất map có mất vùng cấm không?**  
Thường phải vẽ lại no-go zone — nên map lại khi nhà ổn định đồ đạc.
`.trim(),
  },
  {
    baseSlug: 'thay-pin-robot-hut-bui',
    title: 'Thay pin robot hút bụi: dấu hiệu pin chai và quy trình an toàn',
    summary:
      'Pin robot hút bụi chai khiến máy chạy ngắn, sạc bất thường. Dấu hiệu nhận biết, lưu ý an toàn và thay pin tại VESMART Đà Nẵng.',
    seoTitle: 'Thay pin robot hút bụi — dấu hiệu & quy trình | VESMART Đà Nẵng',
    seoDescription:
      'Nhận biết pin robot hút bụi chai, rủi ro tự thay, quy trình thay pin an toàn tại VESMART Đà Nẵng. Tư vấn đúng model.',
    buildContent: ({ a, b, c }) => `
**Thay pin robot hút bụi** đúng lúc giúp máy chạy đủ vòng nhà trở lại và tránh phồng pin — sự cố nguy hiểm nếu tiếp tục sạc ép.

![Pin robot hút bụi chai cần kiểm tra và thay thế](${a})

## Dấu hiệu pin đã chai

- Thời gian chạy giảm rõ (ví dụ từ 90–120 phút xuống còn 20–40 phút)
- % pin tụt nhảy có (từ 40% xuống 5% đột ngột)
- Máy tắt giữa chừng dù app còn báo pin
- Pin / đáy máy **phồng**, nóng bất thường khi sạc
- Không vào sạc hoặc ngắt sạc liên tục

## Vì sao không nên tự ý thay nếu chưa có kinh nghiệm?

Pin lithium robot có bảo vệ (BMS). Sai cực, dùng pin “rẻ không chip”, hoặc làm thủng cell dễ cháy nổ. Nhiều model phải tháo vỏ đúng sequence, dễ gãy chốt / rách dây.

![Thay pin robot hút bụi đúng model tại trung tâm chuyên sửa](${b})

## Quy trình tại VESMART

1. Kiểm tra thực tế: đo dung lượng / loại trừ lỗi sạc trước khi kết luận thay pin  
2. Báo giá pin đúng model (Ecovacs, Roborock, Dreame, Xiaomi…)  
3. Thay thế, test sạc–xả, kiểm tra về dock  
4. Bảo hành linh kiện theo thỏa thuận trên phiếu sửa  

![Hoàn thiện thay pin và test sạc robot tại VESMART Đà Nẵng](${c})

## Mẹo kéo dài tuổi thọ pin

- Tránh để pin 0% nhiều ngày
- Không để máy ngoài nắng / cốp xe nóng
- Dùng dock zin, tránh sạc dự phòng không rõ nguồn
- Bảo dưỡng định kỳ để robot đỡ phải “gắng” trên thảm dày khi pin đã yếu

Xem [sản phẩm](/products) hoặc đọc thêm [bài sửa chữa](/blog) khác trên VESMART.

${ctaBlock()}

## FAQ

**Pin dùng được bao lâu?**  
Thường 1.5–3 năm tùy số chu kỳ và nhiệt độ môi trường.

**Pin generic có dùng được không?**  
Chỉ nên dùng pin có bảo vệ tương thích; VESMART tư vấn loại phù hợp từng máy.

**Thay pin có mất dữ liệu map không?**  
Thường không, nhưng nên cập nhật app và kiểm tra lại dock sau khi thay.
`.trim(),
  },
];

async function pickImages(count: number) {
  const rows = await prisma.image.findMany({
    where: {
      deleted_at: null,
      url: { contains: 'cdn.vesmart.vn' },
    },
    select: { id: true, url: true, width: true, height: true },
    orderBy: { id: 'desc' },
    take: 120,
  });

  const landscape = rows.filter(
    (r) => r.width != null && r.height != null && r.width >= r.height,
  );
  const pool = (landscape.length >= count ? landscape : rows).map((r) => r.url);
  if (pool.length < count) {
    throw new Error(`Need ${count} images, found ${pool.length}`);
  }
  return pool.slice(0, count);
}

async function main() {
  const category = await prisma.postCategory.findFirst({
    where: { slug: 'sua-chua', deleted_at: null },
  });
  if (!category) {
    throw new Error('Post category sua-chua not found');
  }

  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN, deleted_at: null },
    orderBy: { id: 'asc' },
  });
  if (!admin) {
    throw new Error('No ADMIN user found');
  }

  const urls = await pickImages(POSTS.length * 4);
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
    const content = draft.buildContent(imgs);

    const post = await prisma.post.create({
      data: {
        title: draft.title,
        slug: `${draft.baseSlug}-tmp-${Date.now()}`,
        summary: draft.summary,
        content,
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
