/**
 * Publish 3 long SEO posts - Dyson handheld vacuum faults → VESMART.
 * Images: ImageCategory slug `dyson`, fallback `chia-se`.
 *
 * Usage:
 *   pnpm run prisma:seed-seo-dyson
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
const PRIMARY_CAT_SLUG = 'dyson';
const FALLBACK_CAT_SLUG = 'chia-se';

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
## Sửa hút bụi cầm tay Dyson tại VESMART Đà Nẵng

Nếu đã vệ sinh đúng cách mà máy vẫn lỗi, mang **hút bụi cầm tay Dyson** đến **VESMART** để kiểm tra miễn phí:

- Địa chỉ: ${ADDRESS}
- Điện thoại / Zalo: [${PHONE}](${ZALO})
- Tham khảo thêm [sản phẩm & phụ kiện](/products), hỏi kinh nghiệm trên [diễn đàn](/forum), hoặc đọc các [bài sửa chữa khác](/blog)

*Không mất phí nếu không sửa được. Báo giá trước khi thay linh kiện.*
`.trim();
}

const POSTS: PostDraft[] = [
  {
    baseSlug: 'hut-bui-cam-tay-dyson-chay-mot-luc-roi-ngung',
    title:
      'Hút bụi cầm tay Dyson chạy một lúc rồi ngừng: nguyên nhân và cách khắc phục',
    summary:
      'Dyson V7 V8 V10 V11 V12 chạy vài phút rồi tắt: filter tắc, quá nhiệt, pin hoặc mainboard. Checklist dài và sửa tại VESMART Đà Nẵng.',
    seoTitle:
      'Hút bụi cầm tay Dyson chạy một lúc rồi ngừng - cách sửa | VESMART',
    seoDescription:
      'Dyson cầm tay chạy được rồi tắt đột ngột: vệ sinh filter, kiểm tra quá nhiệt, pin. Sửa chuyên nghiệp tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c, d }) => `
**Hút bụi cầm tay Dyson chạy một lúc rồi ngừng** là lỗi rất phổ biến với V7, V8, V10, V11, V12, V15: máy hút mạnh vài phút rồi đột ngột tắt, nhấp nháy đèn, hoặc giảm tốc rồi dừng. Không phải lúc nào cũng do “pin yếu”. Nhiều case chỉ là **filter tắc**, **đầu hút kẹt**, hoặc **bảo vệ quá nhiệt**.

Bài viết giúp bạn tự loại trừ từng bước trước khi mang máy tới **VESMART Đà Nẵng** sửa chuyên sâu.

![Hút bụi cầm tay Dyson chạy một lúc rồi ngừng cần kiểm tra](${a})

## Vì sao Dyson hay tắt giữa chừng?

Dyson dùng motor số vòng quay cao, đường gió hẹp. Khi luồng khí bị chặn, nhiệt độ tăng nhanh. Firmware / mạch bảo vệ sẽ **cắt nguồn** để tránh cháy motor. Đó là lý do máy “chạy một lúc rồi ngừng” dù pin vẫn còn %.

Ngoài ra còn các nhóm nguyên nhân:

1. **Filter / cyclone đầy bụi mịn** (hay gặp nhà nuôi thú, thảm)
2. **Ống / đầu hút kẹt tóc, giấy, hạt**
3. **Pin chai hoặc cell yếu một bên** (chạy Max tắt sớm hơn Eco)
4. **Tiếp điểm pin - thân máy bẩn / cong**
5. **Mainboard / sensor nhiệt lỗi** (tắt dù máy đã sạch)

## Checklist tự xử lý tại nhà (làm theo thứ tự)

### Bước 1: Đổ bụi và kiểm tra cyclone

- Tháo bình chứa, đổ sạch
- Gõ nhẹ cụm cyclone để bụi mịn rơi ra
- Quan sát có dị vật kẹt giữa các nan không

Nếu bỏ qua bước này, chỉ rửa filter ngoài thường **không đủ**.

### Bước 2: Rửa filter đúng cách

Hầu hết Dyson cầm tay có filter có thể rửa:

- Tháo filter, xả nước sạch (không xà phòng đậm đặc trừ khi hãng cho phép)
- Vắt / để **khô hoàn toàn** 24 giờ trước khi lắp
- Filter còn ẩm = lực hút yếu + máy dễ cắt nhiệt sớm

![Vệ sinh filter hút bụi cầm tay Dyson để hết lỗi tắt giữa chừng](${b})

### Bước 3: Kiểm tra đầu hút và ống

- Tháo đầu sàn, đầu khe: cắt tóc quấn trục
- Soi ống nối: lấy dị vật bằng que mềm (không dùng vật kim loại cứng)
- Chạy thử **không gắn đầu hút** (chỉ thân máy). Nếu hết tắt đột ngột, lỗi nằm ở đầu hút / ống.

### Bước 4: Thử chế độ Eco / Med / Max

- Eco chạy lâu hơn mà vẫn tắt sớm: nghi pin hoặc nguồn
- Chỉ Max bị tắt: nghi quá nhiệt do tắc gió hoặc sensor
- Ghi lại thời gian chạy thực tế để kỹ thuật viên chẩn đoán nhanh hơn

### Bước 5: Làm sạch chân pin

Lau tiếp điểm trên pin và trên thân máy. Cong chân, gỉ sét khiến máy “giật nguồn” rồi ngắt.

![Kiểm tra pin và tiếp điểm hút bụi cầm tay Dyson](${c})

## Khi nào nên mang VESMART ngay?

- Đã vệ sinh + filter khô mà vẫn tắt sau 1-3 phút
- Máy nóng bất thường, mùi khét
- Đèn báo lỗi nhấp nháy theo pattern không rõ trong manual
- Pin phồng, thân máy từng vào nước
- Máy còn mới đã cắt liên tục (có thể sensor / board)

Tại **VESMART**, kỹ thuật viên đo dòng motor, kiểm tra bảo vệ nhiệt, test pin thật bằng chu kỳ xả, và báo giá trước khi thay linh kiện.

![Sửa hút bụi cầm tay Dyson chạy một lúc rồi ngừng tại VESMART Đà Nẵng](${d})

### Model thường gặp tại VESMART

V7, V8 Absolute, V10 Absolute, V11, V12 Detect Slim, V15 Detect… Quy trình tương tự; linh kiện pin / filter / board theo đúng mã máy.

${cta()}

## FAQ

**Để máy nguội rồi chạy lại có hết không?**  
Có thể chạy thêm được vài phút nếu do quá nhiệt, nhưng sẽ lặp lại nếu chưa thông đường gió.

**Có nên tháo mainboard tại nhà không?**  
Không khuyến khích. Motor và board Dyson dễ hỏng thêm nếu sai tool.

**Sửa mất bao lâu?**  
Vệ sinh chuyên sâu / thay filter trong ngày. Pin hoặc board thường 1-3 ngày tùy linh kiện.
`.trim(),
  },
  {
    baseSlug: 'hut-bui-cam-tay-dyson-hut-yeu',
    title:
      'Hút bụi cầm tay Dyson hút yếu: nguyên nhân, vệ sinh đúng và khi nào cần sửa',
    summary:
      'Dyson lực hút yếu dù pin đầy: filter, cyclone, seal, motor. Hướng dẫn dài cách lấy lại lực hút và sửa tại VESMART Đà Nẵng.',
    seoTitle:
      'Hút bụi cầm tay Dyson hút yếu - khắc phục & sửa | VESMART',
    seoDescription:
      'Dyson cầm tay hút yếu, không hút sạch: vệ sinh filter cyclone, kiểm tra seal. Sửa motor tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c, d }) => `
**Hút bụi cầm tay Dyson hút yếu** khiến nhiều người nghĩ máy “đã già” và muốn đổi mới. Thực tế, đa số trường hợp lấy lại được 70-90% lực hút sau khi **vệ sinh đúng** cyclone, filter và seal. Chỉ khi motor mòn hoặc gioăng hở nặng mới cần sửa tại trung tâm.

Bài viết đi sâu từng nguyên nhân, cách tự làm tại nhà, và dấu hiệu nên mang **VESMART**.

![Hút bụi cầm tay Dyson hút yếu cần vệ sinh cyclone và filter](${a})

## Dấu hiệu hút yếu rõ ràng

- Hút được tóc trên sàn cứng nhưng không nhấc được hạt / cát
- Trước đây hút tốt thảm, nay phải đi nhiều lần
- Máy kêu to hơn bình thường nhưng lực gió ra cửa xả yếu
- Bình bụi gần như trống mà vẫn cảm giác “nghẹt”
- Gắn đầu khe thì gần như không hút

## Các nguyên nhân theo mức độ thường gặp

### 1. Filter tắc bụi mịn (hay gặp nhất)

Filter HEPA / washable giữ bụi siêu mịn. Khi bão hòa, motor vẫn quay nhưng **lưu lượng khí giảm**. Người dùng hay chỉ đổ bình, quên filter.

**Cách xử lý:** tháo filter, rửa, để khô 24 giờ. Không dùng máy sấy nóng sát filter.

### 2. Cyclone bị bám bụi dầu / lông

Lớp bụi mịn dính nan cyclone làm giảm tách bụi. Máy “kêu khỏe” nhưng hút kém.

**Cách xử lý:** tháo cụm theo manual, dùng bàn chải mềm + nước (nếu hãng cho phép rửa phần đó), lau khô kỹ.

![Làm sạch cyclone hút bụi cầm tay Dyson khi lực hút yếu](${b})

### 3. Gioăng (seal) / nắp bình lắp không khít

Hở khí = mất chân không. Hay gặp sau khi tháo lắp nhiều lần hoặc gioăng biến dạng.

**Cách xử lý:** kiểm tra nắp bình đóng hết cỡ, quan sát gioăng cao su có nứt / méo không.

### 4. Đầu hút / ống tắc một phần

Tóc quấn trục làm chổi không quay (đầu motorized), hoặc dị vật nằm giữa ống.

**Cách xử lý:** tháo đầu sàn, cắt tóc, soi ống bằng đèn pin.

### 5. Motor / quạt mòn (cần sửa)

Lực hút giảm dần theo năm, kèm tiếng rít, mùi cháy nhẹ, hoặc rung lạ. Đây là lúc nên mang VESMART thay vì cố dùng tiếp.

![Kiểm tra đầu hút và ống khi Dyson hút yếu](${c})

## Quy trình 20 phút lấy lại lực hút

1. Đổ bình + gõ cyclone  
2. Rửa filter, để khô (nếu gấp: dùng filter dự phòng khô)  
3. Làm sạch đầu sàn  
4. Chạy thử trên sàn gạch với chế độ Max trong 30 giây  
5. So sánh cảm giác gió ở miệng hút (có thể dùng tờ giấy mỏng để test)

Nếu sau khi filter **khô hoàn toàn** mà vẫn yếu rõ so với lúc mới: ghi lại model + tình trạng, mang kiểm tra.

## Sửa tại VESMART: mang gì và được làm gì?

- Mang **thân máy + pin + đầu hút** đang dùng
- Kỹ thuật viên đo lưu lượng / nghe motor, kiểm tra seal và board
- Thay filter zin hoặc tương thích đúng mã, thay motor khi cần
- Test lại lực hút trước khi trả máy

![Sửa hút bụi cầm tay Dyson hút yếu tại VESMART Đà Nẵng](${d})

Nhà ở Đà Nẵng, Hội An, liên vùng miền Trung có thể mang trực tiếp hoặc liên hệ Zalo để được hướng dẫn.

${cta()}

## FAQ

**Filter假 / không chính hãng có làm hút yếu hơn không?**  
Có thể, nếu sai kích thước hoặc mật độ sai. Nên dùng đúng mã máy.

**Rửa filter bao lâu một lần?**  
Nhà bình thường 1-3 tháng; nhà nhiều lông thú có thể hàng tháng.

**Dyson hút yếu có liên quan pin không?**  
Pin yếu thường làm máy tụt chế độ hoặc tắt sớm hơn là “gió yếu khi đang Max ổn định”. Nếu Max ổn định mà gió yếu: nghi đường gió / motor.
`.trim(),
  },
  {
    baseSlug: 'hut-bui-cam-tay-dyson-nhanh-het-pin',
    title:
      'Hút bụi cầm tay Dyson nhanh hết pin: nhận biết pin chai và quy trình thay tại VESMART',
    summary:
      'Dyson V8 V10 V11 hết pin quá nhanh, % tụt đột ngột. Phân biệt pin chai, tắc gió và thay pin an toàn tại VESMART Đà Nẵng.',
    seoTitle:
      'Hút bụi cầm tay Dyson nhanh hết pin - thay pin | VESMART',
    seoDescription:
      'Dyson cầm tay pin tụt nhanh, chạy ngắn: dấu hiệu pin chai, lưu ý an toàn. Thay pin tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c, d }) => `
**Hút bụi cầm tay Dyson nhanh hết pin** khiến thời gian hút thực tế giảm từ 20-40 phút xuống còn 5-10 phút, hoặc % pin nhảy có (từ 40% xuống tắt máy). Đây là dấu hiệu **pin lithium chai** hoặc máy phải “gắng” vì tắc gió. Bài viết giúp bạn phân biệt đúng nguyên nhân trước khi quyết định thay pin tại **VESMART**.

![Hút bụi cầm tay Dyson nhanh hết pin cần kiểm tra](${a})

## Thời gian chạy “chuẩn” tham khảo

Tùy model và chế độ:

- **Eco / Low:** thường lâu nhất, phù hợp sàn cứng
- **Med:** cân bằng
- **Max / Boost:** rất ngắn, bình thường chỉ vài phút

Nếu **Eco cũng dưới 8-10 phút** (với máy từng chạy 20 phút+), nên nghi pin hoặc máy cắt nhiệt liên tục vì tắc.

## Phân biệt pin chai và tắc gió

| Hiện tượng | Pin chai | Tắc filter / gió |
| --- | --- | --- |
| Thời gian Eco ngắn dần theo tháng | Hay gặp | Í thể |
| Tắt đột ngột kèm nóng miệng hút | Í thể | Hay gặp |
| % pin tụt nhảy, báo đầy nhưng chạy ngắn | Hay gặp | Í |
| Sau khi vệ sinh filter khô vẫn ngắn | Hay gặp | Í |
| Máy nóng bất thường ngay từ phút đầu | Nghi cell / board | Nghi tắc nặng |

**Mẹo:** vệ sinh triệt để + filter khô, chạy Eco trên sàn gạch trống. Nếu vẫn hết pin quá nhanh: hướng tới pin.

![So sánh triệu chứng pin chai và filter tắc trên Dyson cầm tay](${b})

## Dấu hiệu cần thay pin sớm

1. Pin phồng, nứt vỏ, mối hàn / chân pin nóng bất thường  
2. Sạc mãi không đầy, hoặc đầy ảo  
3. Máy tắt khi chỉ chạm nhẹ / xoay pin  
4. Có mùi bất thường khi sạc  
5. Tuổi pin thường 2-4 năm tùy chu kỳ sạc

## Việc không nên làm

- Không tự khoan / tự thay cell nếu không có dụng cụ và kiến thức BMS  
- Không dùng sạc không rõ nguồn  
- Không để pin ngoài cốp xe nắng nóng  
- Không tiếp tục dùng pin phồng

## Quy trình thay pin tại VESMART

1. **Kiểm tra miễn phí:** loại trừ tắc gió và lỗi sạc trước khi kết luận thay pin  
2. **Báo giá theo model** (V7/V8/V10/V11/V12/V15…)  
3. **Thay pin tương thích**, kiểm tra chân tiếp xúc  
4. **Test sạc - xả thực tế**, đo thời gian chạy Eco / Max  
5. **Bảo hành linh kiện** theo thỏa thuận trên phiếu

![Thay pin hút bụi cầm tay Dyson tại trung tâm VESMART](${c})

### Mẹo kéo dài tuổi thọ pin Dyson

- Không luôn sạc 24/7 trên dock nếu hãng không yêu cầu; tránh để 0% nhiều ngày  
- Ưu tiên Eco khi hút hàng ngày; Max chỉ khi cần  
- Giữ filter sạch để motor không kéo dòng cao liên tục  
- Bảo quản khô ráo, tránh để máy trong môi trường ẩm lâu

![Hoàn thiện thay pin và test thời gian chạy Dyson tại VESMART](${d})

Nếu bạn ở Đà Nẵng hoặc khu vực lân cận (Hội An, Điện Bàn…), có thể mang máy + pin trong giờ làm việc. Nhắn Zalo trước để xếp lịch nhanh.

${cta()}

## FAQ

**Pin generic có dùng được không?**  
Chỉ nên loại có bảo vệ tương thích. VESMART tư vấn loại phù hợp từng model để tránh lỗi sạc / báo % sai.

**Thay pin có mất cài đặt không?**  
Dyson cầm tay hầu như không lưu map như robot; thay pin không ảnh hưởng “cài đặt” phức tạp.

**Sạc không vào có phải lỗi pin?**  
Có thể pin, dock sạc, hoặc chân tiếp xúc. Mang cả pin và thân máy (kèm dock nếu có) để kiểm tra đủ.
`.trim(),
  },
];

async function urlsFromCategory(slug: string) {
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

async function pickImages(count: number) {
  const primary = await urlsFromCategory(PRIMARY_CAT_SLUG);
  const fallback = await urlsFromCategory(FALLBACK_CAT_SLUG);
  const out: string[] = [];
  const source = primary.length > 0 ? primary : fallback;
  if (source.length === 0) {
    throw new Error(
      `No images in ${PRIMARY_CAT_SLUG} or fallback ${FALLBACK_CAT_SLUG}`,
    );
  }
  for (let i = 0; i < count; i++) {
    out.push(source[i % source.length]);
  }
  console.log(
    `Images: dyson=${primary.length}, fallback=${fallback.length}, using=${out.length}`,
  );
  return out;
}

async function main() {
  for (const draft of POSTS) {
    assertNoEmDash('title', draft.title);
    assertNoEmDash('summary', draft.summary);
    assertNoEmDash('seoTitle', draft.seoTitle);
    assertNoEmDash('seoDescription', draft.seoDescription);
  }

  const category = await prisma.postCategory.findFirst({
    where: { slug: 'sua-chua', deleted_at: null },
  });
  if (!category) throw new Error('Post category sua-chua not found');

  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN, deleted_at: null },
    orderBy: { id: 'asc' },
  });
  if (!admin) throw new Error('No ADMIN user found');

  const urls = await pickImages(POSTS.length * 5);
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

    const offset = i * 5;
    const imgs = {
      thumb: urls[offset],
      a: urls[offset + 1],
      b: urls[offset + 2],
      c: urls[offset + 3],
      d: urls[offset + 4],
    };
    const content = draft.buildContent(imgs);
    assertNoEmDash(`content:${draft.baseSlug}`, content);

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
    const dysonImgs = [imgs.thumb, imgs.a, imgs.b, imgs.c, imgs.d].filter((u) =>
      u.includes('/dyson/'),
    ).length;
    console.log(`OK #${post.id} ${url} (dyson-imgs ${dysonImgs}/5)`);
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
