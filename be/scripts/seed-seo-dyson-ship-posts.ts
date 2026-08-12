/**
 * Publish 5 SEO posts - Dyson cầm tay + gửi sửa xa (SPX) → VESMART.
 * Images: dyson + chia-se (VESMART) + ship (tạo mục nếu thiếu).
 *
 * Usage:
 *   pnpm run prisma:seed-seo-dyson-ship
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

const DYSON_SLUG = 'dyson';
const VESMART_SLUG = 'chia-se';
const SHIP_SLUG = 'ship';

type PostDraft = {
  baseSlug: string;
  categorySlug: 'huong-dan' | 'sua-chua';
  title: string;
  summary: string;
  seoTitle: string;
  seoDescription: string;
  buildContent: (imgs: {
    thumb: string;
    dyson: string;
    ship: string;
    vesmart: string;
    extra: string;
  }) => string;
};

function shipBlock(): string {
  return `
## Gửi Dyson từ xa qua SPX (hoặc đơn vị khác)

**Bước 1:** Nhắn Zalo [${PHONE}](${ZALO}) gửi **model** (V7/V8/V10/V11/V12...), **mô tả lỗi** và **video ngắn** nếu có.

**Bước 2:** Đóng gói máy:
- Tháo đầu hút, gom phụ kiện vào túi riêng
- Bọc bubble quanh thân + cụm pin
- Cho vào hộp carton cứng, lấp khoảng trống bằng giấy / xốp

**Bước 3:** Tạo đơn **SPX** (hoặc Viettel Post, GHN...) gửi tới:

> ${ADDRESS}  
> Người nhận: VESMART - ${PHONE}

**Bước 4:** Ghi chú vận đơn: *Gửi sửa máy - không cho xem hàng / không giao hàng một phần*.

**Bước 5:** Chụp **mã vận đơn** gửi lại Zalo. VESMART nhận hàng → kiểm tra miễn phí → báo giá → sửa → gửi ngược lại bằng đơn bạn chọn.
`.trim();
}

function cta(): string {
  return `
## Liên hệ VESMART trước khi gửi máy

- Zalo / điện thoại: [${PHONE}](${ZALO})
- Địa chỉ nhận máy: ${ADDRESS}
- Xem thêm [sản phẩm & linh kiện](/products), hỏi trên [diễn đàn](/forum), [blog sửa chữa](/blog)

*Kiểm tra miễn phí. Không sửa được thì không thu phí sửa chữa.*
`.trim();
}

const POSTS: PostDraft[] = [
  {
    baseSlug: 'gui-hut-bui-cam-tay-dyson-sua-xa-spx',
    categorySlug: 'huong-dan',
    title:
      'Gửi hút bụi cầm tay Dyson đi sửa xa qua SPX: hướng dẫn từ A đến Z',
    summary:
      'Khách xa Đà Nẵng gửi Dyson V7-V12 sửa qua SPX: đóng gói, tạo đơn, Zalo VESMART. Áp dụng Hà Nội, TP.HCM, Huế, miền Trung.',
    seoTitle:
      'Gửi Dyson cầm tay sửa xa qua SPX | Hướng dẫn VESMART Đà Nẵng',
    seoDescription:
      'Cách gửi hút bụi cầm tay Dyson sửa từ xa qua SPX. Đóng gói, địa chỉ VESMART, Zalo 0971183153. Hà Nội, TP.HCM, Huế, toàn quốc.',
    buildContent: ({ dyson, ship, vesmart, extra }) => `
Bạn ở **Hà Nội, TP.HCM, Huế, Quảng Nam, Nha Trang, Cần Thơ** hay bất kỳ tỉnh thành nào mà không tới cửa hàng được? **VESMART Đà Nẵng** vẫn nhận **hút bụi cầm tay Dyson** gửi qua **SPX**, Viettel Post hoặc đơn vị vận chuyển khác.

Bài viết tóm tắt quy trình gửi máy an toàn, tránh vỡ pin / vỡ cyclone, và cách liên hệ Zalo để được hỗ trợ trước khi ship.

![Hút bụi cầm tay Dyson gửi sửa xa qua SPX](${dyson})

## Ai nên gửi máy thay vì mang trực tiếp?

- Ở xa **Đà Nẵng / Hội An** (ví dụ **Hà Nội, Hải Phòng, Bình Dương, Đồng Nai, Huế, Quảng Ngãi, Gia Lai**)
- Máy lỗi pin / mainboard cần thợ kiểm tra chuyên sâu
- Đã thử vệ sinh filter mà vẫn tắt giữa chừng
- Muốn **báo giá trước** khi thay linh kiện

${shipBlock()}

![Đóng gói gửi hút bụi cầm tay Dyson qua SPX](${ship})

## Lưu ý khi gửi Dyson cầm tay

| Việc nên làm | Việc tránh |
| --- | --- |
| Gửi ảnh model + tem serial qua Zalo | Gửi máy chưa mô tả lỗi |
| Bọc kỹ pin và thân máy | Để pin lỏng trong hộp mềm |
| Giữ phụ kiện riêng, ghi chú trong hộp | Gửi kèm hóa chất / dung dịch lạ |
| Lưu mã vận đơn 2 chiều | Chọn “cho xem hàng” với máy điện |

![VESMART Đà Nẵng nhận máy Dyson gửi từ các tỉnh thành](${vesmart})

## Khu vực VESMART thường nhận máy gửi đi

Miền Bắc: **Hà Nội, Hải Phòng, Thanh Hóa, Nghệ An**  
Miền Trung: **Huế, Quảng Nam, Quảng Ngãi, Bình Định, Phú Yên, Khánh Hòa (Nha Trang)**  
Miền Nam: **TP.HCM, Bình Dương, Đồng Nai, Vũng Tàu, Cần Thơ, Đà Lạt (Lâm Đồng)**

Thời gian ship thường **2-4 ngày** tùy tuyến. Nhắn Zalo trước để VESMART theo dõi mã vận đơn.

![Gửi Dyson sửa tại VESMART từ xa toàn quốc](${extra})

${cta()}

## FAQ

**Có bắt buộc dùng SPX không?**  
Không. SPX phổ biến và dễ tạo đơn app. Viettel Post, GHN, GHTK đều được nếu gửi tới đúng địa chỉ VESMART.

**Gửi máy có mất phí kiểm tra không?**  
Kiểm tra miễn phí. Chỉ thu khi đồng ý sửa (VESMART báo giá trước).

**Mất bao lâu có hàng về?**  
Tùy lỗi và linh kiện. Thường **3-7 ngày** kể cả 2 chiều ship với lỗi thường gặp.

**Có cần gửi sạc kèm không?**  
Nên gửi nếu nghi lỗi sạc / pin. Ghi rõ trong Zalo để thợ test đủ bộ.
`.trim(),
  },
  {
    baseSlug: 'sua-dyson-ha-noi-tphcm-gui-may-vesmart',
    categorySlug: 'sua-chua',
    title:
      'Sửa hút bụi cầm tay Dyson tại VESMART: khách Hà Nội, TP.HCM gửi máy thế nào?',
    summary:
      'Khách Hà Nội, TP.HCM, Bình Dương gửi Dyson V8 V10 V11 sửa tại VESMART Đà Nẵng. Quy trình Zalo, SPX, báo giá và ship ngược.',
    seoTitle:
      'Sửa Dyson Hà Nội TP.HCM gửi VESMART Đà Nẵng | SPX',
    seoDescription:
      'Sửa hút bụi cầm tay Dyson cho khách Hà Nội, TP.HCM: gửi máy SPX về VESMART Đà Nẵng. Zalo 0971183153, báo giá trước.',
    buildContent: ({ dyson, ship, vesmart, extra }) => `
Nhiều khách **Hà Nội, TP.HCM, Bình Dương, Long An** hỏi: có gửi **Dyson cầm tay** về **VESMART Đà Nẵng** sửa được không? Câu trả lời là **có**, và quy trình khá giống mua hàng online: bạn ship máy đi, shop kiểm tra, sửa, ship ngược lại.

![Sửa hút bụi cầm tay Dyson cho khách Hà Nội TP.HCM tại VESMART](${dyson})

## Lỗi Dyson hay gặp khi khách gửi từ xa

1. **Chạy một lúc rồi ngừng** (filter tắc, quá nhiệt, pin)
2. **Hút yếu** dù đã vệ sinh
3. **Pin tụt nhanh / không sạc**
4. **Kêu to, rung** ở cyclone hoặc motor
5. **Đèn báo lỗi** trên V10/V11/V12

Trước khi gửi, thử **rửa filter khô hoàn toàn** và kiểm tra đầu hút kẹt tóc. Nếu vẫn lỗi, gửi máy hợp lý hơn tự tháo mainboard.

${shipBlock()}

![Khách TP.HCM gửi Dyson qua SPX về VESMART Đà Nẵng](${ship})

## Quy trình riêng cho khách Hà Nội / TP.HCM

1. Zalo VESMART: gửi **ảnh máy + mã model + mô tả lỗi**
2. Thợ tư vấn sơ bộ: có cần gửi máy ngay hay thử thêm bước nào
3. Bạn tạo đơn SPX **Hà Nội → Đà Nẵng** hoặc **TP.HCM → Đà Nẵng**
4. VESMART nhận hàng, test, **Zalo báo giá**
5. Đồng ý sửa → làm xong → gửi ngược (cùng địa chỉ nhận của bạn)

Thời gian ship **Hà Nội - Đà Nẵng** hoặc **TP.HCM - Đà Nẵng** thường **2-3 ngày** mỗi chiều.

![VESMART kiểm tra Dyson gửi từ Hà Nội và TP.HCM](${vesmart})

## Chi phí cần dự trù

- **Phí ship 2 chiều** (bạn trả hoặc chọn COD tùy đơn)
- **Phí sửa / linh kiện** (VESMART báo trước qua Zalo)
- **Không phí kiểm tra** nếu không sửa được

![Dyson V10 V11 gửi sửa từ miền Bắc miền Nam về Đà Nẵng](${extra})

${cta()}

## FAQ

**Hà Nội gửi mất mấy ngày tới Đà Nẵng?**  
SPX thường **2-3 ngày làm việc**. Nên gửi sớm trong tuần, tránh lễ tết.

**TP.HCM có shop Dyson gần, sao gửi Đà Nẵng?**  
Nhiều khách chọn VESMART vì **báo giá rõ**, sửa pin/mainboard cầm tay và theo dõi Zalo tiện. Bạn cân nhắc theo giá và uy tín.

**Có bảo hành sau sửa không?**  
VESMART báo cụ thể theo linh kiện / hạng mục khi báo giá.

**Gửi V8 hay V15 khác nhau không?**  
Khác **model pin và linh kiện**. Ghi đúng model khi Zalo để tránh nhầm phụ tùng.
`.trim(),
  },
  {
    baseSlug: 'gui-dyson-tu-hue-quang-nam-vesmart',
    categorySlug: 'huong-dan',
    title:
      'Gửi Dyson sửa từ Huế, Quảng Nam, Quảng Ngãi về VESMART Đà Nẵng',
    summary:
      'Khách Huế, Tam Kỳ, Quảng Ngãi, Bình Định gửi Dyson cầm tay qua SPX về VESMART. Gần hơn Hà Nội, ship nhanh, Zalo hỗ trợ.',
    seoTitle:
      'Gửi Dyson sửa Huế Quảng Nam Quảng Ngãi → VESMART | SPX',
    seoDescription:
      'Hướng dẫn gửi hút bụi cầm tay Dyson từ Huế, Quảng Nam, Quảng Ngãi, Bình Định về VESMART Đà Nẵng qua SPX.',
    buildContent: ({ dyson, ship, vesmart, extra }) => `
**Huế, Hội An, Tam Kỳ (Quảng Nam), Quảng Ngãi, Quy Nhon (Bình Định)** cách **VESMART Đà Nẵng** gần hơn nhiều so với Hà Nẵng hay TP.HCM. Khách miền Trung thường **ship 1 ngày** là shop nhận được máy nếu gửi sớm buổi sáng qua **SPX**.

![Gửi Dyson từ Huế Quảng Nam về VESMART Đà Nẵng](${dyson})

## Vì sao khách miền Trung hay chọn VESMART?

- Gần **Đà Nẵng**, ship rẻ và nhanh hơn gửi ra Hà Nội / TP.HCM
- Sửa **Dyson cầm tay** và robot hút bụi cùng một chỗ
- Zalo phản hồi nhanh, báo giá trước khi thay linh kiện
- Có thể gửi từ **Quảng Trị, Thừa Thiên Huế, Quảng Nam, Quảng Ngãi, Bình Định, Phú Yên**

## Checklist trước khi mang / gửi máy

- Chụp video lỗi (tắt giữa chừng, hút yếu, không sạc...)
- Ghi model: V7, V8, V10, V11, V12...
- Tháo filter ướt, **chỉ gửi khi khô**
- Bọc pin cẩn thận (không để vật nặng đè)

${shipBlock()}

![Ship Dyson từ miền Trung qua SPX tới VESMART](${ship})

## Thời gian ship tham khảo (SPX)

| Tỉnh / thành | Thường mất (ngày làm việc) |
| --- | --- |
| Huế | 1-2 |
| Quảng Nam (Hội An, Tam Kỳ) | 1 |
| Quảng Ngãi | 1-2 |
| Bình Định (Quy Nhon) | 2 |
| Phú Yên, Khánh Hòa | 2-3 |

![VESMART Đà Nẵng nhận Dyson gửi từ Huế Quảng Nam](${vesmart})

Khách **Hội An** có thể mang trực tiếp nếu tiện; khách **Huế / Quảng Ngãi** gửi SPX vẫn tiết kiệm thời gian hơn tìm chỗ sửa không chuyên Dyson.

![Hút bụi cầm tay Dyson sửa nhanh cho khách miền Trung](${extra})

${cta()}

## FAQ

**Huế gửi sáng mai Đà Nẵng nhận được không?**  
Nhiều đơn SPX **cùng ngày hoặc ngày hôm sau**. Tùy khung giờ lấy hàng.

**Quảng Ngãi có cần gửi cả hộp Dyson gốc không?**  
Không bắt buộc. Hộp carton cứng + bubble là đủ nếu đóng gói kỹ.

**Sửa xong gửi về Huế mất bao lâu?**  
Thường **1-2 ngày ship** + thời gian sửa (tùy lỗi).

**Có nhận máy cuối tuần không?**  
Nhắn Zalo trước; VESMART xác nhận giờ nhận hàng tại cửa hàng.
`.trim(),
  },
  {
    baseSlug: 'dong-goi-dyson-ship-spx-an-toan',
    categorySlug: 'huong-dan',
    title:
      'Checklist đóng gói Dyson trước khi ship SPX: tránh vỡ, tránh lỗi pin',
    summary:
      'Cách bọc hút bụi cầm tay Dyson gửi SPX an toàn: pin, cyclone, phụ kiện. Áp dụng mọi tỉnh gửi về VESMART Đà Nẵng.',
    seoTitle:
      'Đóng gói Dyson gửi SPX an toàn | VESMART Đà Nẵng',
    seoDescription:
      'Checklist đóng gói hút bụi cầm tay Dyson trước khi gửi SPX về VESMART. Tránh vỡ cyclone, lỗi pin. Toàn quốc.',
    buildContent: ({ dyson, ship, vesmart, extra }) => `
Ship máy điện sai cách dễ **vỡ cyclone**, **cong tiếp điểm pin**, hoặc **móp thân**. Bài viết là checklist đóng gói **Dyson cầm tay** trước khi gửi **SPX** về **VESMART** (áp dụng cho khách **Hà Nội, TP.HCM, Cần Thơ, Nha Trang, Đà Lạt**, v.v.).

![Đóng gói hút bụi cầm tay Dyson trước khi gửi SPX](${dyson})

## Chuẩn bị vật tư

- Hộp carton (càng cứng càng tốt)
- Bọc khí / bubble wrap
- Giấy kraft hoặc xốp lấp khoảng trống
- Băng keo trong / băng keo nhiều lớp
- Túi zip cho ống, đầu hút nhỏ

## 6 bước đóng gói

### 1. Tắt máy, tháo pin (nếu model tháo rời được)

Pin và thân nên **bọc riêng** 2-3 lớp bubble.

### 2. Tháo đầu hút, ống mở rộng

Gom phụ kiện vào túi, cho vào hộp phụ hoặc cùng hộp nhưng **cố định** bằng giấy.

### 3. Bảo vệ cyclone

Đừng để cyclone chịu lực nén. Đặt **đứng hoặc nằm ổn định**, không xoáy ốc vào thành hộp.

### 4. Lấp đầy khoảng trống

Lắc hộp nhẹ: không nghe tiếng lộn xộn. Máy không được trượt trong hộp.

### 5. Dán nhãn

Ghi: *Máy điện - dễ vỡ - không xếp chồng / không cắt thùng*.

### 6. Chụp ảnh trước khi giao shipper

Lưu ảnh + gửi VESMART qua Zalo nếu cần tra soát.

![Bọc bubble gửi Dyson qua SPX về VESMART](${ship})

## Khi tạo đơn SPX

- **Người nhận:** VESMART, ${PHONE}
- **Địa chỉ:** ${ADDRESS}
- **Ghi chú:** Gửi sửa máy, không cho xem hàng
- Chọn **bảo hiểm / giá trị hàng hóa** nếu máy giá trị cao (V11/V15)

![VESMART hướng dẫn đóng gói Dyson từ khách toàn quốc](${vesmart})

${shipBlock()}

![Gửi Dyson an toàn từ các tỉnh thành về Đà Nẵng](${extra})

${cta()}

## FAQ

**Gửi filter ướt được không?**  
Không. Filter phải **khô hoàn toàn** tránh mốc và hỏng motor.

**Có cần hộp Dyson zin?**  
Không bắt buộc. Quan trọng là **chống sốc**.

**Shipper SPX có bọc thêm giúp không?**  
Một số bưu cục có túi bọc. Bạn vẫn nên bọc kỹ trước khi giao.

**Máy vỡ khi ship ai chịu?**  
Chọn bảo hiểm và chụp ảnh đóng gói. Trao đổi Zalo với VESMART ngay khi nhận hàng lỗi bao bì.
`.trim(),
  },
  {
    baseSlug: 'dyson-loi-pin-gui-sua-tu-xa-vesmart',
    categorySlug: 'sua-chua',
    title:
      'Dyson cầm tay lỗi pin: có nên gửi đi sửa? Quy trình VESMART từ xa',
    summary:
      'Dyson V8 V10 V11 pin chai, không sạc: gửi SPX về VESMART Đà Nẵng. Khách Hà Nội, TP.HCM, Huế, Nha Trang, Cần Thơ được hỗ trợ Zalo.',
    seoTitle:
      'Dyson lỗi pin gửi sửa từ xa | VESMART SPX toàn quốc',
    seoDescription:
      'Dyson cầm tay lỗi pin, không sạc: gửi sửa qua SPX về VESMART Đà Nẵng. Hướng dẫn Zalo, báo giá. Hà Nội, TP.HCM, Huế, Nha Trang.',
    buildContent: ({ dyson, ship, vesmart, extra }) => `
**Pin Dyson cầm tay** chai sau 2-4 năm là chuyện thường: máy **chạy vài phút rồi tắt**, **không sạc**, **sạc nóng**, hoặc **% nhảy loạn**. Thay pin đúng loại cần thợ có linh kiện và dụng cụ. Khách ở **Hà Nội, TP.HCM, Huế, Nha Trang, Cần Thơ, Thanh Hóa, Nghệ An** có thể **gửi máy về VESMART Đà Nẵng** qua SPX.

![Dyson cầm tay lỗi pin gửi sửa từ xa tại VESMART](${dyson})

## Nhận biết pin Dyson cần sửa / thay

- Chạy chế độ Max **dưới 5 phút** là tắt
- Cắm sạc vài phút vẫn 0% hoặc nhảy 100% ngay
- Pin / đế sạc **nóng bất thường**, mùi nhựa
- Máy tắt dù filter sạch, đầu hút không kẹt

**Không nên** tự mở pin nếu không có kinh nghiệm cell lithium.

## Quy trình gửi sửa pin từ xa

1. Zalo [${PHONE}](${ZALO}): gửi **model + ảnh pin + mô tả lỗi**
2. VESMART ước lượng **có thay pin / sửa tiếp điểm / mainboard** không
3. Bạn đóng gói và ship SPX (xem checklist đóng gói trên blog)
4. Shop test pin, **báo giá chính xác**
5. Đồng ý → thay pin / sửa → test chạy thử → ship ngược

![Gửi Dyson lỗi pin qua SPX về VESMART Đà Nẵng](${ship})

## Pin zin, pin thay thế và bảo hành

- VESMART báo rõ **loại pin / cell** trước khi làm
- Máy **V8, V10, V11** khác nhau về pack pin
- Hỏi **thời gian bảo hành pin** khi nhận báo giá Zalo

Khách **TP.HCM, Bình Dương** hay **Hà Nội** gửi pin lỗi nhiều vì dùng Max thường xuyên trên thảm.

![VESMART test pin hút bụi cầm tay Dyson](${vesmart})

${shipBlock()}

![Sửa pin Dyson gửi từ Hà Nội Huế Nha Trang về Đà Nẵng](${extra})

${cta()}

## FAQ

**Thay pin Dyson mất bao lâu?**  
Thường **1-2 ngày làm việc** tại shop nếu có linh kiện. Cộng thời gian ship 2 chiều.

**Gửi pin lỗi qua SPX có an toàn không?**  
An toàn nếu **pin không phồng / không rò**, bọc kỹ, không để pin tiếp xúc kim loại lộ thiên. Pin phồng: dừng dùng, báo VESMART ngay.

**Sửa pin xong có test trước khi gửi lại không?**  
VESMART chạy thử các chế độ trước khi trả hàng. Bạn có thể xin **video test** qua Zalo.

**Ngoài pin còn lỗi gì hay gửi xa?**  
Filter tắc (tự xử lý được), **motor yếu**, **mainboard**, **công tắc** thường cần gửi máy.
`.trim(),
  },
];

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

function preferLandscape(
  rows: { url: string; width: number | null; height: number | null }[],
) {
  const ls = rows.filter(
    (r) => r.width != null && r.height != null && r.width >= r.height,
  );
  return [...ls, ...rows.filter((r) => !ls.includes(r))];
}

async function ensureShipCategory() {
  const vesmart = await prisma.imageCategory.findFirst({
    where: { slug: 'vesmart', deleted_at: null },
  });
  let ship = await prisma.imageCategory.findFirst({
    where: { slug: SHIP_SLUG, deleted_at: null },
  });
  if (!ship) {
    ship = await prisma.imageCategory.create({
      data: {
        name: 'Ship / Giao hàng',
        slug: SHIP_SLUG,
        parent_id: vesmart?.id ?? null,
        sort_order: 2,
      },
    });
    console.log(`Created image category ${SHIP_SLUG} #${ship.id}`);
  }
  const count = await prisma.image.count({
    where: { category_id: ship.id, deleted_at: null },
  });
  if (count === 0) {
    const vesmartImgs = await prisma.image.findMany({
      where: {
        deleted_at: null,
        category: { slug: VESMART_SLUG },
        url: { contains: 'cdn.vesmart.vn' },
      },
      take: 8,
      orderBy: { id: 'desc' },
    });
    for (const src of vesmartImgs) {
      await prisma.image.create({
        data: {
          category_id: ship.id,
          url: src.url,
          r2_key: `${src.r2_key}-ship-ref`,
          description: 'Ship / giao hàng (tham chiếu VESMART)',
          mime: src.mime,
          bytes: src.bytes,
          width: src.width,
          height: src.height,
        },
      });
    }
    console.log(`Seeded ${vesmartImgs.length} ship category images`);
  }
  return ship.id;
}

async function pickImagesForPost(
  index: number,
  dyson: string[],
  vesmart: string[],
  ship: string[],
) {
  const d = dyson[index % dyson.length];
  const s = ship[(index + 1) % ship.length];
  const v = vesmart[(index + 2) % vesmart.length];
  const e = dyson[(index + 3) % dyson.length];
  const thumb = dyson[(index + 4) % dyson.length];
  return { thumb, dyson: d, ship: s, vesmart: v, extra: e };
}

async function main() {
  for (const draft of POSTS) {
    assertNoEmDash('title', draft.title);
    assertNoEmDash('summary', draft.summary);
    assertNoEmDash('seoTitle', draft.seoTitle);
    assertNoEmDash('seoDescription', draft.seoDescription);
  }

  await ensureShipCategory();

  const dysonRows = preferLandscape(await urlsFromCategory(DYSON_SLUG));
  const vesmartRows = preferLandscape(await urlsFromCategory(VESMART_SLUG));
  const shipRows = preferLandscape(await urlsFromCategory(SHIP_SLUG));

  const dyson = dysonRows.map((r) => r.url);
  const vesmart = vesmartRows.map((r) => r.url);
  const ship = shipRows.map((r) => r.url);

  if (dyson.length < 5 || vesmart.length < 3 || ship.length < 3) {
    throw new Error(
      `Need images: dyson=${dyson.length}, vesmart=${vesmart.length}, ship=${ship.length}`,
    );
  }

  console.log(
    `Images: dyson=${dyson.length}, vesmart=${vesmart.length}, ship=${ship.length}`,
  );

  const categories = await prisma.postCategory.findMany({
    where: { deleted_at: null },
  });
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));

  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN, deleted_at: null },
    orderBy: { id: 'asc' },
  });
  if (!admin) throw new Error('No ADMIN user found');

  const created: string[] = [];

  for (let i = 0; i < POSTS.length; i++) {
    const draft = POSTS[i];
    const postCat = catBySlug.get(draft.categorySlug);
    if (!postCat) throw new Error(`Missing post category ${draft.categorySlug}`);

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

    const imgs = await pickImagesForPost(i, dyson, vesmart, ship);
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
        published_at: new Date(Date.now() - i * 120_000),
        author: { connect: { id: admin.id } },
        category: { connect: { id: postCat.id } },
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
