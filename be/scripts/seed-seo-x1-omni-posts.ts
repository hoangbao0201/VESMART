/**
 * Publish 5 SEO posts - Ecovacs Deebot X1 OMNI faults → VESMART repair.
 * Images: category ecovacs-deebot-x1-omni, fallback chia-se (VESMART).
 *
 * Usage:
 *   pnpm run prisma:seed-seo-x1-omni
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
const PRIMARY_CAT_SLUG = 'ecovacs-deebot-x1-omni';
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
  }) => string;
};

function cta(): string {
  return `
## Sửa Ecovacs Deebot X1 OMNI tại VESMART Đà Nẵng

Nếu đã thử các bước trên mà máy vẫn lỗi, mang **Ecovacs Deebot X1 OMNI** đến **VESMART** để kiểm tra miễn phí:

- Địa chỉ: ${ADDRESS}
- Điện thoại / Zalo: [${PHONE}](${ZALO})
- Xem thêm [sản phẩm & linh kiện](/products) hoặc hỏi trên [diễn đàn](/forum)

*Không mất phí nếu không sửa được.*
`.trim();
}

const POSTS: PostDraft[] = [
  {
    baseSlug: 'ecovacs-deebot-x1-omni-tu-chay-ra-khoi-tram',
    title:
      'Ecovacs Deebot X1 OMNI tự chạy ra khỏi trạm: nguyên nhân và cách xử lý',
    summary:
      'X1 OMNI tự rời dock, chạy lung tung khi đang sạc. Checklist cảm biến, chân sạc, firmware và khi nào mang sửa tại VESMART Đà Nẵng.',
    seoTitle:
      'Ecovacs Deebot X1 OMNI tự chạy ra khỏi trạm - cách khắc phục | VESMART',
    seoDescription:
      'X1 OMNI tự chạy ra khỏi trạm sạc: kiểm tra cảm biến, chân sạc, OMNI Station. Sửa chuyên nghiệp tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c }) => `
**Ecovacs Deebot X1 OMNI** tự chạy ra khỏi trạm khi đang sạc hoặc vừa dock xong thường do tiếp xúc sạc kém, cảm biến bẩn, hoặc trạm OMNI bị lệch. Bài viết giúp bạn tự loại trừ trước khi mang máy tới VESMART.

![Ecovacs Deebot X1 OMNI tự chạy ra khỏi trạm sạc OMNI](${a})

## Dấu hiệu thường gặp

- Robot vừa lên dock vài giây rồi tự lùi ra
- App báo đang sạc nhưng máy vẫn di chuyển
- Chạy vòng quanh trạm rồi đứng giữa nhà
- Đèn trạm / robot nhấp nháy bất thường

## Checklist tự kiểm tra

### 1. Chân sạc và tiếp điểm trạm

Lau sạch **chân sạc dưới robot** và **tiếp điểm trên OMNI Station** bằng khăn khô. Bụi ẩm làm mất tiếp xúc khiến máy tưởng chưa vào dock nên tự chạy lại.

### 2. Vị trí trạm OMNI

- Đặt sát tường, hai bên trống theo hướng dẫn Ecovacs
- Không kê thảm dày dưới trạm
- Không di chuyển trạm sau khi đã lưu map

![Vệ sinh chân sạc Ecovacs Deebot X1 OMNI và trạm OMNI](${b})

### 3. Cảm biến và firmware

- Lau LIDAR / cảm biến quanh thân
- Cập nhật firmware và app Ecovacs Home
- Thử khởi động lại robot + trạm (rút nguồn 30 giây)

### 4. Khi nào cần sửa tại VESMART?

- Tiếp điểm cong, cháy, oxi hóa nặng
- Board sạc / module trạm lỗi
- Robot vẫn tự thoát dock dù đã vệ sinh và cập nhật phần mềm

![Sửa lỗi Ecovacs Deebot X1 OMNI tự chạy ra khỏi trạm tại VESMART](${c})

${cta()}

## FAQ

**X1 OMNI tự ra khỏi trạm ban đêm có nguy hiểm không?**  
Máy có thể hết pin giữa nhà. Nên xử lý sớm, tránh sạc ép liên tục.

**Reset map có hết lỗi không?**  
Hữu ích nếu trạm đã bị dời. Nếu lỗi phần cứng thì vẫn cần mang kiểm tra.

**VESMART có sửa trạm OMNI không?**  
Có. Nên mang cả robot và trạm khi lỗi liên quan sạc / dock.
`.trim(),
  },
  {
    baseSlug: 'ecovacs-deebot-x1-omni-khong-ve-tram',
    title:
      'Ecovacs Deebot X1 OMNI không về trạm: hướng dẫn khắc phục chi tiết',
    summary:
      'X1 OMNI không tìm thấy dock, đứng cách trạm vài cm hoặc hết pin giữa phòng. Cách xử lý cảm biến, map và sửa tại VESMART.',
    seoTitle:
      'Ecovacs Deebot X1 OMNI không về trạm sạc - khắc phục | VESMART',
    seoDescription:
      'X1 OMNI không về trạm: lau LIDAR, căn OMNI Station, reset map. Sửa module định vị tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c }) => `
**Ecovacs Deebot X1 OMNI không về trạm** là lỗi định vị / dock rất hay gặp: máy chạy hết pin giữa nhà, về gần OMNI Station rồi đứng im, hoặc app báo không tìm thấy trạm.

![Ecovacs Deebot X1 OMNI không về trạm sạc cần kiểm tra](${a})

## Nguyên nhân phổ biến

1. LIDAR / cảm biến bẩn
2. Trạm bị dời so với map cũ
3. Chân sạc bẩn: về gần nhưng không “khớp” dock
4. Ánh sáng / đồ đạc chắn mặt trạm
5. Firmware / map lỗi sau mất điện

## Xử lý từng bước

### Vệ sinh cảm biến

Lau nhẹ nắp LIDAR và mắt cảm biến bằng khăn microfiber khô. Không dùng dung môi mạnh.

### Căn lại OMNI Station

- Để trạm cố định, mặt trước thoáng
- Gọi “về trạm” từ app khi pin trên 20%
- Nếu vẫn lỗi: xóa map, để máy **map lại từ trạm**

![Vệ sinh LIDAR giúp Ecovacs Deebot X1 OMNI về trạm chính xác](${b})

### Khi cần kỹ thuật viên VESMART

- LIDAR không quay hoặc kêu lạ
- App báo lỗi navigation / laser liên tục
- Robot về sát trạm nhưng không vào dock dù chân sạc đã sạch
- Va đập mạnh làm lệch module định vị

![Sửa Ecovacs Deebot X1 OMNI không về trạm tại VESMART Đà Nẵng](${c})

Tham khảo thêm các bài sửa chữa trên [blog VESMART](/blog) hoặc hỏi nhanh trên [diễn đàn](/forum).

${cta()}

## FAQ

**Chỉ mang robot hay mang cả trạm?**  
Nên mang cả hai để kiểm tra tiếp điểm và nguồn trạm.

**Nhà nhiều ngưỡng cửa ảnh hưởng không?**  
Có. Đặt trạm ở khu robot thường chạy, tránh ngưỡng cao.

**Sửa mất bao lâu?**  
Lỗi vệ sinh / map trong ngày. Lỗi LIDAR hoặc board có thể 1-3 ngày tùy linh kiện.
`.trim(),
  },
  {
    baseSlug: 'ecovacs-deebot-x1-omni-khong-ket-noi-wifi',
    title:
      'Ecovacs Deebot X1 OMNI không kết nối được WiFi: cách xử lý nhanh',
    summary:
      'X1 OMNI không vào mạng, app Ecovacs Home không tìm thấy máy. Checklist 2.4GHz, reset mạng và khi nào mang sửa tại VESMART.',
    seoTitle:
      'Ecovacs Deebot X1 OMNI không kết nối WiFi - cách sửa | VESMART',
    seoDescription:
      'X1 OMNI mất WiFi, không pair app: kiểm tra 2.4GHz, reset mạng, firmware. Sửa module WiFi tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c }) => `
**Ecovacs Deebot X1 OMNI không kết nối được WiFi** khiến bạn mất điều khiển app, không cập nhật map / firmware. Phần lớn do router hoặc cấu hình mạng; một số case là module WiFi / mainboard.

![Ecovacs Deebot X1 OMNI không kết nối được WiFi với app](${a})

## Lưu ý mạng trước khi pair

- Robot Ecovacs thường cần **WiFi 2.4GHz** (không phải 5GHz thuần)
- Tắt VPN trên điện thoại khi đang kết nối
- Đứng gần robot và router khi setup
- Mật khẩu WiFi đúng, không ký tự đặc biệt gây lỗi (thử đổi tạm nếu cần)

## Checklist tại nhà

1. Khởi động lại router và robot
2. Trên app Ecovacs Home: thêm lại thiết bị / reset mạng robot theo hướng dẫn hãng
3. Tách SSID 2.4GHz nếu router đang gộp band
4. Thử điểm phát sóng điện thoại (2.4GHz hotspot) để loại trừ lỗi router
5. Cập nhật app lên bản mới nhất

![Thiết lập lại WiFi cho Ecovacs Deebot X1 OMNI](${b})

## Khi nào mang VESMART?

- Reset mạng nhiều lần vẫn không thấy máy
- Robot không vào chế độ pair (không đèn / không tín hiệu kết nối)
- Máy từng vào nước hoặc rơi, nghi hỏng anten / module WiFi
- Các thiết bị khác vào WiFi bình thường, chỉ X1 OMNI lỗi

![Sửa lỗi WiFi Ecovacs Deebot X1 OMNI tại trung tâm VESMART](${c})

${cta()}

## FAQ

**Mesh WiFi có dùng được không?**  
Được nếu có SSID 2.4GHz ổn định. Tránh bắt máy sang AP quá xa khi đang pair.

**Đổi router có mất map không?**  
Thường giữ được nếu robot vẫn login cùng tài khoản Ecovacs; nên đồng bộ lại sau khi vào mạng mới.

**VESMART có hỗ trợ cấu hình app không?**  
Có. Nếu phần cứng ổn, kỹ thuật viên hướng dẫn pair lại; nếu module lỗi sẽ báo giá thay thế.
`.trim(),
  },
  {
    baseSlug: 'ecovacs-deebot-x1-omni-bat-len-khong-co-am-thanh',
    title:
      'Ecovacs Deebot X1 OMNI bật lên không có âm thanh: kiểm tra và sửa',
    summary:
      'X1 OMNI mở nguồn im lặng, không beep, app vẫn có hoặc không. Phân biệt tắt tiếng, loa hỏng và lỗi mainboard tại VESMART.',
    seoTitle:
      'Ecovacs Deebot X1 OMNI bật lên không có âm thanh | VESMART',
    seoDescription:
      'X1 OMNI không có tiếng khi bật: kiểm tra volume app, chế độ Do Not Disturb, loa. Sửa tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c }) => `
**Ecovacs Deebot X1 OMNI bật lên không có âm thanh** khiến nhiều người tưởng máy “chết”. Thực tế có thể chỉ tắt tiếng trên app, hoặc loa / board âm thanh hỏng.

![Ecovacs Deebot X1 OMNI bật lên không có âm thanh cần kiểm tra](${a})

## Phân loại nhanh

| Triệu chứng | Gợi ý |
| --- | --- |
| Máy chạy bình thường, chỉ không tiếng | Volume / DND trên app |
| Không tiếng, không phản hồi nút | Pin / mainboard / nguồn |
| Có đèn, im lặng hoàn toàn | Loa hoặc cáp loa |
| Mất tiếng sau vào nước / rơi | Linh kiện cần mở máy kiểm tra |

## Việc nên làm trước

1. Mở Ecovacs Home: tăng âm lượng robot, tắt chế độ không làm phiền (nếu có)
2. Khởi động lại robot
3. Cập nhật firmware
4. Thử nhấn nút nguồn / reset theo hướng dẫn model X1 OMNI
5. Kiểm tra máy có rung / đèn phản hồi khi bấm nút không

![Kiểm tra cài đặt âm thanh Ecovacs Deebot X1 OMNI trên app](${b})

## Khi cần mang VESMART

- Đã bật volume max mà vẫn im
- Không có tiếng báo lỗi dù máy báo fault trên app
- Từng ngập nước, đổ nước vào thân
- Kèm triệu chứng treo, tự tắt, không sạc

Kỹ thuật viên kiểm tra loa, jack, mainboard - báo giá trước khi thay.

![Sửa loa và mainboard Ecovacs Deebot X1 OMNI tại VESMART](${c})

${cta()}

## FAQ

**Tắt tiếng có ảnh hưởng định vị không?**  
Không. Âm thanh chỉ là phản hồi người dùng.

**Có thay loa rời được không?**  
Tùy tình trạng cụm linh kiện. VESMART kiểm tra thực tế rồi tư vấn.

**Máy im nhưng vẫn hút bình thường có nên sửa?**  
Nên nếu bạn cần cảnh báo lỗi bằng âm thanh, hoặc nghi máy từng bị nước.
`.trim(),
  },
  {
    baseSlug: 'ecovacs-deebot-x1-omni-bi-treo',
    title:
      'Ecovacs Deebot X1 OMNI bị treo: nguyên nhân và cách khắc phục',
    summary:
      'X1 OMNI treo máy, đứng hình, app không điều khiển hoặc nút không phản hồi. Reset an toàn và sửa tại VESMART Đà Nẵng.',
    seoTitle:
      'Ecovacs Deebot X1 OMNI bị treo máy - cách xử lý | VESMART',
    seoDescription:
      'X1 OMNI bị treo, đơ app, không nhận lệnh: soft reset, cập nhật firmware. Sửa mainboard tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c }) => `
**Ecovacs Deebot X1 OMNI bị treo** (đơ, không nhận nút, app quay mãi, giữa chừng dừng và không phản hồi) thường liên quan firmware, bộ nhớ tạm, hoặc mainboard / pin.

![Ecovacs Deebot X1 OMNI bị treo cần reset và kiểm tra](${a})

## Dấu hiệu treo máy

- Đèn kẹt một trạng thái, bấm nút không đổi
- App hiện offline hoặc loading liên tục dù WiFi nhà ổn
- Đang hút thì đứng im, không về trạm, không tắt được bình thường
- Sau sạc dậy máy “đơ”, phải rút nguồn trạm mới tỉnh

## Xử lý an toàn tại nhà

1. Giữ nút nguồn theo hướng dẫn hãng để tắt / soft reset
2. Rút nguồn OMNI Station 30-60 giây, đặt lại robot lên trạm
3. Khởi động lại điện thoại và app Ecovacs Home
4. Cập nhật firmware khi máy đã ổn định
5. Tránh reset factory ngay nếu chưa backup map (trừ khi bắt buộc)

![Reset Ecovacs Deebot X1 OMNI khi máy bị treo](${b})

## Khi nên mang VESMART ngay

- Treo lặp lại mỗi ngày dù đã cập nhật phần mềm
- Kèm nóng bất thường, mùi cháy, pin phồng
- Treo sau khi vào nước hoặc sốc điện
- Không vào được chế độ pair / không nhận sạc sau khi treo

![Sửa mainboard Ecovacs Deebot X1 OMNI bị treo tại VESMART](${c})

Tại VESMART, máy được kiểm tra nguồn, pin, mainboard và chạy thử chu trình sạc - hút - về trạm trước khi trả.

${cta()}

## FAQ

**Factory reset có hết treo không?**  
Đôi khi hết nếu lỗi phần mềm. Nếu mainboard / pin lỗi thì vẫn treo lại.

**Có mất map khi mang sửa không?**  
Thường giữ được; nếu phải nạp lại firmware kỹ thuật viên sẽ báo trước.

**X1 OMNI còn bảo hành hãng thì sao?**  
Nếu còn bảo hành chính hãng, ưu tiên trung tâm Ecovacs. Hết bảo hành hoặc cần sửa nhanh: VESMART hỗ trợ.
`.trim(),
  },
];

async function urlsFromCategory(slug: string, preferLandscape = false) {
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
    select: { url: true, width: true, height: true },
    orderBy: { id: 'desc' },
  });
  if (!preferLandscape) return rows.map((r) => r.url);
  const landscape = rows.filter(
    (r) => r.width != null && r.height != null && r.width >= r.height,
  );
  const pool = landscape.length > 0 ? landscape : rows;
  return pool.map((r) => r.url);
}

async function pickImages(count: number) {
  const primary = await urlsFromCategory(PRIMARY_CAT_SLUG, false);
  const fallback = await urlsFromCategory(FALLBACK_CAT_SLUG, false);
  const out: string[] = [];
  if (primary.length > 0) {
    for (let i = 0; i < count; i++) out.push(primary[i % primary.length]);
  } else {
    for (let i = 0; i < count; i++) {
      if (fallback.length === 0) break;
      out.push(fallback[i % fallback.length]);
    }
  }
  if (out.length < count) {
    throw new Error(
      `Need ${count} images from ${PRIMARY_CAT_SLUG} (+${FALLBACK_CAT_SLUG}), got ${out.length}`,
    );
  }
  console.log(
    `Images: primary=${primary.length}, fallback=${fallback.length}, using=${out.length} (cycle X1 when short)`,
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
    console.log(`OK #${post.id} ${url}`);
    console.log(`  thumb cat path: ${imgs.thumb.includes(PRIMARY_CAT_SLUG) ? PRIMARY_CAT_SLUG : 'fallback/other'}`);
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
