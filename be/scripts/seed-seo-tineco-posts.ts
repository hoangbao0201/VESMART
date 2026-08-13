/**
 * Publish 5 long SEO posts - Tineco Floor One (giới thiệu + lỗi thường gặp) → VESMART.
 * Images: ImageCategory `tineco-floor-one-s3` + `tineco-floor-one-stretch-s6`, fallback `chia-se`.
 *
 * Usage:
 *   pnpm run prisma:seed-seo-tineco
 */
import { PostStatus, PrismaClient, UserRole } from '@prisma/client';
import {
  assertNoEmDash,
  FALLBACK_IMAGE_CAT,
  type ImageRow,
  loadEnvFile,
  preferLandscape,
  repairCta,
  SITE,
  urlsFromCategory,
} from './lib/seo-seed';

loadEnvFile();

const prisma = new PrismaClient();
const PRIMARY_SLUGS = ['tineco-floor-one-s3', 'tineco-floor-one-stretch-s6'];

type PostDraft = {
  baseSlug: string;
  categorySlug: 'sua-chua' | 'huong-dan' | 'reviews';
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

function cta(heading?: string): string {
  return repairCta({
    productLabel: 'máy lau sàn hút bụi Tineco',
    heading: heading ?? 'Sửa máy lau sàn Tineco tại VESMART Đà Nẵng',
  });
}

const POSTS: PostDraft[] = [
  {
    baseSlug: 'gioi-thieu-may-lau-san-tineco-floor-one',
    categorySlug: 'reviews',
    title:
      'Máy lau sàn hút bụi Tineco Floor One: ưu nhược điểm và khi nào nên mang sửa',
    summary:
      'Máy lau sàn Tineco Floor One S3 / Stretch S6 hút ướt khô, tự giặt con lăn. Ưu nhược điểm thực tế và dấu hiệu cần sửa tại VESMART Đà Nẵng.',
    seoTitle:
      'Máy lau sàn Tineco Floor One: ưu nhược điểm & sửa chữa | VESMART',
    seoDescription:
      'Máy lau sàn hút bụi Tineco Floor One gọn, hút nước bẩn tự giặt con lăn. Phân biệt lỗi thường gặp và khi nào mang VESMART Đà Nẵng.',
    buildContent: ({ a, b, c, d }) => `
**Máy lau sàn hút bụi Tineco Floor One** (dòng S3, Stretch S6 và các biến thể tương tự) là loại wet-dry cầm tay: vừa hút bụi khô, vừa hút nước bẩn khi lau, có bình nước sạch / nước bẩn và **con lăn tự giặt**. Nhiều nhà ở Đà Nẵng chọn Tineco vì gọn, lau nhanh khu vực bếp - phòng khách.

Bài viết tóm tắt cách máy hoạt động, ưu nhược điểm thực tế, và **dấu hiệu nên mang VESMART** thay vì cố dùng tiếp.

![Máy lau sàn hút bụi Tineco Floor One tổng quan](${a})

## Tineco Floor One hoạt động thế nào?

Luồng làm việc cơ bản:

1. Bình nước sạch phun / cấp ẩm cho con lăn
2. Con lăn xoay chà sàn, đồng thời motor hút nước bẩn + bụi vào bình bẩn
3. Khi đặt lên đế (một số model), máy có thể **tự giặt và sấy** con lăn

Vì vậy hầu hết lỗi Tineco xoay quanh: **bơm nước**, **đường hút**, **con lăn / ổ bi**, **pin - nguồn**, và **sensor mực nước**.

## Ưu điểm thực tế

- Lau + hút một lần, ít phải kéo thêm cây lau
- Con lăn tự làm sạch giúp giảm mùi nếu vệ sinh đúng
- Phù hợp căn hộ, mặt gạch men, vinyl (tránh thảm dày nếu hãng không khuyến nghị)
- App / đèn báo trên một số model giúp biết khi bình đầy / cần giặt

## Nhược điểm cần biết trước khi dùng lâu

- Filter và ống hút dễ tắc nếu đổ nước bẩn chậm
- Con lăn quấn tóc / lông thú nếu không cắt thường xuyên
- Pin chai sau 2-3 năm dùng Max liên tục
- Linh kiện chính hãng không bán rông rãi như robot; nên sửa chỗ có **test bơm + hút + con lăn**

![Chi tiết con lăn và bình nước máy Tineco Floor One](${b})

## Bảo dưỡng định kỳ (giảm 50% lỗi)

### Mỗi lần dùng

- Đổ bình nước bẩn ngay
- Xả / giặt con lăn, không để ẩm trong máy cả đêm ngoài chu trình sấy
- Lau miệng bình và gioăng

### Mỗi tuần

- Rửa filter (để khô hoàn toàn mới lắp)
- Kiểm tra ống hút có dị vật
- Cắt tóc quanh trục con lăn

### Mỗi tháng

- Kiểm tra tiếp điểm sạc / đế
- Xem có mùi hôi từ bình bẩn không (cần rửa bằng dung dịch nhẹ theo hướng dẫn hãng)

## Dấu hiệu nên mang VESMART sớm

- Hút không lên nước bẩn dù con lăn ướt
- Lực hút yếu dù đã rửa filter
- Máy bật không lên / tắt đột ngột
- Con lăn không quay hoặc kêu rít
- Báo lỗi mực nước / bơm dù bình còn nước

Càng để lâu, motor hút và bơm càng dễ hỏng theo do chạy non tải hoặc quá nhiệt.

![Kiểm tra máy lau sàn Tineco trước khi mang sửa](${c})

## FAQ

### Tineco Floor One S3 và Stretch S6 khác nhau chỗ nào?

Stretch S6 thường linh hoạt hơn ở góc tường / gầm tủ nhờ cơ cấu gập. Logic lỗi (hút, bơm, con lăn, pin) **giống họ Floor One**.

### Có tự sửa được không?

Vệ sinh filter, ống, con lăn: được. Tháo mainboard / thay bơm / ổ bi: nên để thợ có linh kiện và máy test.

### VESMART nhận những model nào?

Các dòng lau sàn hút bụi cầm tay Tineco phổ biến (Floor One S3, Stretch S6…). Mang theo đế sạc nếu máy không lên nguồn.

![Tineco Floor One sau khi vệ sinh đúng cách](${d})

${cta('Giới thiệu xong: mang Tineco tới VESMART khi cần sửa')}
`.trim(),
  },
  {
    baseSlug: 'tineco-hut-khong-duoc-nuoc-ban',
    categorySlug: 'sua-chua',
    title:
      'Tineco hút không được nước bẩn: checklist và cách sửa tại Đà Nẵng',
    summary:
      'Máy lau sàn Tineco hút không lên nước bẩn thường do tắc ống, gioăng hở, bơm yếu hoặc sensor. Checklist dài và sửa tại VESMART Đà Nẵng.',
    seoTitle:
      'Tineco hút không được nước bẩn - nguyên nhân & sửa | VESMART',
    seoDescription:
      'Máy Tineco Floor One hút không lên nước bẩn: tắc đường hút, gioăng, bơm, sensor. Checklist tự xử lý và sửa tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c, d }) => `
**Máy lau sàn Tineco hút không được nước bẩn** là lỗi hay gặp trên Floor One S3 / Stretch S6: con lăn vẫn ướt, sàn có nước, nhưng bình bẩn gần như trống hoặc chỉ vào rất ít. Nếu cứ dùng, nước bẩn chảy ngược, mùi hôi và motor hút dễ quá nhiệt.

Dưới đây là checklist theo thứ tự từ dễ đến khó, rồi hướng xử lý chuyên sâu tại **VESMART Đà Nẵng**.

![Tineco hút không được nước bẩn cần kiểm tra đường hút](${a})

## Nhận diện đúng lỗi

- Con lăn quay, máy ồn bình thường, nhưng **bình bẩn không tăng mực**
- Có tiếng gió nhưng lực hút miệng kém
- Thỉnh thoảng hút được rồi lại không (nghẽn từng đoạn)
- Báo đầy bình / lỗi hút dù bình còn trống

Khác với lỗi “hút yếu khô”: ở đây trọng tâm là **hút nước / đường ướt**.

## Nguyên nhân phổ biến

1. **Ống hút / miệng hút tắc** tóc, giấy, cát
2. **Filter ướt hoặc tắc bùn**
3. **Gioăng bình bẩn / nắp bình hở** làm mất chân không
4. **Bơm hoặc van một chiều** kẹt / hỏng
5. **Sensor mực nước** báo sai → máy cắt chu trình hút
6. **Mainboard điều khiển hút** lỗi (ít hơn)

![Tháo bình bẩn và filter máy Tineco khi không hút nước](${b})

## Checklist tự xử lý tại nhà

### Bước 1: Đổ và lắp lại bình bẩn đúng khớp

- Tháo bình, rửa sạch, lau khô gioăng
- Lắp nghe **cách rõ**, không lệch ray
- Gioăng biến dạng / rách → thay gioăng (mang VESMART nếu không có sẵn)

### Bước 2: Thông đường hút

- Tháo phần ống nối từ đầu lau lên thân (theo model)
- Soi đèn pin: tóc quấn, hạt cứng, miếng giẻ vụn
- Dùng que mềm, **không** chọc vật sắc làm thủng ống

### Bước 3: Filter và lưới lọc

- Rửa filter, để **khô 24h** mới lắp
- Filter ẩm = hút nước kém + dễ báo lỗi

### Bước 4: Test “nghe hút”

- Bật máy, đặt tay gần miệng hút (cẩn thận nước)
- Có gió mạnh mà không vào bình → nghi van / gioăng / tắc sau filter
- Gió yếu → nghi motor hút hoặc tắc nặng

### Bước 5: Reset / cập nhật firmware (nếu có app)

Một số model Tineco có app. Reset cảm biến mực nước theo hướng dẫn hãng trước khi kết luận hỏng bo.

![Test lực hút nước trên máy lau sàn Tineco](${c})

## Việc VESMART làm khi bạn mang máy tới

1. Test chân không + đo dòng motor hút
2. Kiểm tra van một chiều / đường ướt
3. Test sensor bình bẩn
4. Báo giá thay linh kiện **trước** khi làm
5. Test lại bằng nước sạch trên bề mặt mẫu

Mang theo: thân máy, bình sạch / bẩn, đế (nếu có), mô tả “hút khô còn được không”.

## FAQ

### Chỉ hút kém trên gạch bóng có sao không?

Có thể miệng hút không khít. Thử trên bề mặt phẳng sạch. Nếu mọi bề mặt đều không vào nước → lỗi máy.

### Có nên đổ hóa chất mạnh vào bình?

Không. Dễ phá gioăng và sensor. Dùng dung dịch hãng khuyến nghị hoặc nước sạch.

### Sửa mất bao lâu?

Case tắc / gioăng: nhanh trong ngày. Thay bơm / motor: tùy linh kiện, VESMART báo trước.

![Máy Tineco sau khi thông đường hút nước bẩn](${d})

${cta('Sửa Tineco hút không được nước tại VESMART')}
`.trim(),
  },
  {
    baseSlug: 'tineco-hut-yeu-luc-hut-kem',
    categorySlug: 'sua-chua',
    title: 'Tineco hút yếu: nguyên nhân filter, motor và cách khắc phục',
    summary:
      'Máy lau sàn Tineco hút yếu dù đã đổ bình thường do filter tắc, ống nghẽn, pin yếu hoặc motor mòn. Checklist và sửa tại VESMART Đà Nẵng.',
    seoTitle: 'Tineco hút yếu - checklist sửa lực hút | VESMART Đà Nẵng',
    seoDescription:
      'Máy Tineco Floor One hút yếu: filter, ống, pin, motor. Các bước tự vệ sinh và khi nào mang sửa tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c, d }) => `
**Máy lau sàn Tineco hút yếu** khiến bụi và nước bẩn còn lại trên sàn, máy phải đi nhiều vòng, pin hết nhanh hơn. Trên Floor One S3 / Stretch S6, lực hút giảm thường đến từ **đường gió bẩn** trước khi đến mức thay motor.

Bài viết phân nhóm nguyên nhân và checklist dài để bạn tự loại trừ, rồi mang **VESMART Đà Nẵng** nếu cần đo motor / mainboard.

![Máy lau sàn Tineco hút yếu cần vệ sinh đường gió](${a})

## Phân biệt hút yếu khô vs hút yếu ướt

- **Yếu cả khô lẫn ướt**: filter / ống / motor / pin
- **Khô ổn, ướt yếu**: nghi đường nước bẩn, van, gioăng (xem thêm bài hút không được nước)
- **Chỉ yếu khi pin thấp**: cell pin chai hoặc bảo vệ dòng

## Nguyên nhân hay gặp

1. Filter đầy bụi mịn / chưa khô
2. Bình bẩn gần đầy hoặc lắp lệch
3. Ống hút kẹt tóc
4. Con lăn quá bẩn làm “bít” miệng hút
5. Pin yếu → mạch giảm công suất
6. Motor hút mòn / bạc đạn kêu
7. Rò khí do nắp, gioăng

![Rửa filter máy Tineco khi lực hút giảm](${b})

## Checklist tăng lực hút tại nhà

### 1. Đổ bình bẩn + rửa miệng bình

Đừng để mức nước sát miệng; cảm biến có thể giảm hút.

### 2. Rửa filter đúng quy trình

- Xả nước sạch
- Không vắt xoắn mạnh làm xô khung
- Phơi khô hoàn toàn
- Lắp đúng chiều

### 3. Vệ sinh con lăn và lưỡi cắt tóc

Con lăn bẩn = ma sát + che miệng hút. Cắt tóc quanh trục, giặt sạch, sấy / hong khô.

### 4. Soi ống và đầu hút

Dùng đèn pin. Tắc 30% tiết diện đã làm hút tụt rõ.

### 5. Thử Eco / Max

- Max cũng yếu → nghi cơ khí / motor
- Chỉ Max yếu, Eco tạm ổn → nghi pin hoặc bảo vệ nhiệt

### 6. Kiểm tra đế sạc / % pin

Pin báo ảo (nhảy %): mang đo dung lượng tại VESMART.

![So sánh lực hút trước và sau khi vệ sinh Tineco](${c})

## Khi nào cần thợ?

- Đã vệ sinh kỹ 2-3 lần mà hút vẫn kém
- Motor kêu to / mùi khét
- Máy nóng bất thường sau vài phút
- Hút yếu kèm nước vào bình chậm

VESMART đo chân không, dòng motor, tình trạng pin và báo giá thay từng phần.

## FAQ

### Dùng nước nóng có giúp không?

Không khuyến nghị. Có thể biến dạng nhựa / gioăng.

### Có nên tháo motor tại nhà?

Không, nếu chưa có linh kiện và kinh nghiệm. Dễ hỏng ốc nhựa và mất cân bằng cánh quạt.

### Bảo hành hãng còn không?

Hết bảo hành hoặc lỗi do tắc bẩn thường là sửa dịch vụ. VESMART nhận máy hết BH.

![Tineco Floor One phục hồi lực hút sau bảo dưỡng](${d})

${cta('Sửa Tineco hút yếu tại VESMART Đà Nẵng')}
`.trim(),
  },
  {
    baseSlug: 'tineco-bat-khong-len-khong-nguon',
    categorySlug: 'sua-chua',
    title: 'Tineco bật không lên: pin, đế sạc, mainboard và cách xử lý',
    summary:
      'Máy lau sàn Tineco bật không lên thường do pin cạn bảo vệ, đế sạc hỏng, nút nguồn hoặc mainboard. Checklist an toàn và sửa tại VESMART.',
    seoTitle: 'Tineco bật không lên - kiểm tra pin & nguồn | VESMART',
    seoDescription:
      'Máy Tineco Floor One không lên nguồn: đế sạc, pin, nút nguồn, mainboard. Các bước an toàn và sửa tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c, d }) => `
**Máy lau sàn Tineco bật không lên** (không đèn, không phản hồi nút nguồn) khiến nhiều người nghĩ máy “chết”. Thực tế trên Floor One S3 / Stretch S6, phần lớn case là **pin vào chế độ bảo vệ sâu**, **đế sạc / tiếp điểm bẩn**, hoặc **nút nguồn / bo nguồn** lỗi.

Làm theo checklist dưới đây trước khi mở máy. Nếu vẫn tắt ngúm, mang cả **thân + đế** tới **VESMART Đà Nẵng**.

![Máy Tineco bật không lên cần kiểm tra đế sạc](${a})

## Các mức triệu chứng

| Triệu chứng | Gợi ý nhanh |
| --- | --- |
| Không đèn khi đặt đế | Đế / adapter / tiếp điểm |
| Đế có đèn, máy không | Pin / tiếp điểm thân / bo |
| Nhấp nháy rồi tắt | Pin yếu / bảo vệ / short |
| Bật được nhưng tắt ngay | Quá nhiệt / short motor / nước vào bo |

## Checklist an toàn tại nhà

### Bước 1: Nguồn đế sạc

- Thử ổ điện khác
- Kiểm tra dây adapter có đứt / nóng bất thường không
- Đèn đế có sáng khi không đặt máy không (tùy model)

### Bước 2: Làm sạch tiếp điểm

- Lau chân sạc trên máy và đế bằng khăn khô
- Loại bỏ gỉ xanh / nước cứng
- Đặt máy khớp hết hành trình, giữ 30-60 phút

### Bước 3: Sạc đủ thời gian sau khi cạn sâu

Pin để lâu có thể tụt áp. Cắm **2-3 giờ** rồi mới thử bật. Không nhấn nguồn liên tục.

### Bước 4: Tháo bình / con lăn thử khô

Nếu nước lọt khay điện, lau khô, hong 24h ở nơi thoáng (không dùng máy sấy nhiệt cao).

### Bước 5: Reset mềm (nếu hãng có)

Một số model: giữ nút nguồn 10-15 giây. Xem app / manual đúng model của bạn.

![Làm sạch tiếp điểm sạc máy lau sàn Tineco](${b})

## Nguyên nhân kỹ thuật thường gặp

1. **Cell pin chai / BMS khóa**
2. **Adapter sai nguồn hoặc yếu**
3. **Cầu chì / MOSFET nguồn trên mainboard**
4. **Nút nguồn bị oxy hóa**
5. **Chạm nước vào bo** sau khi giặt máy sai cách
6. **Short motor / bơm** khiến bo cắt ngay khi bật

## VESMART xử lý thế nào?

- Đo điện áp đế và dòng sạc
- Đo pack pin / BMS
- Test nút nguồn và bo
- Chỉ thay phần hỏng, báo giá trước
- Test bật máy, sạc, chạy thử hút + con lăn

Mang theo đế zin. Thiếu đế sẽ khó loại trừ nguồn ngoài.

![Kỹ thuật viên kiểm tra nguồn máy Tineco tại VESMART](${c})

## FAQ

### Máy vừa hút nước xong tắt ngúm có nguy hiểm không?

Ngắt đế sạc, không tự tháo bo khi còn ướt. Hong khô rồi mang kiểm tra chống chạm nước.

### Có thay pin được không?

Được nếu còn linh kiện tương thích. VESMART báo tình trạng cell và chi phí trước.

### Có nên mua đế “rẻ” online?

Dễ sai thông số, cháy pin. Ưu tiên đế đúng model hoặc linh kiện thợ cung cấp.

![Tineco Floor One hoạt động lại sau khi xử lý nguồn](${d})

${cta('Sửa Tineco bật không lên tại VESMART')}
`.trim(),
  },
  {
    baseSlug: 'tineco-con-lan-khong-hoat-dong',
    categorySlug: 'sua-chua',
    title:
      'Tineco con lăn không hoạt động: kẹt tóc, motor con lăn và cách sửa',
    summary:
      'Máy lau sàn Tineco con lăn không quay thường do tóc quấn, ổ bi kẹt, hộp số hoặc motor. Checklist và sửa tại VESMART Đà Nẵng.',
    seoTitle:
      'Tineco con lăn không quay - nguyên nhân & sửa | VESMART',
    seoDescription:
      'Con lăn máy Tineco Floor One không hoạt động: tóc quấn, ổ bi, motor, cảm biến. Cách tự xử lý và sửa tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c, d }) => `
**Con lăn máy lau sàn Tineco không hoạt động** (không quay, quay giật, hoặc kêu rít rồi dừng) làm mất công năng lau. Trên Floor One S3 / Stretch S6, con lăn gắn motor riêng hoặc hộp số; lỗi cơ học chiếm đa số nếu nhà có tóc / lông thú.

Checklist dưới đây giúp bạn tự gỡ kẹt an toàn. Nếu motor / hộp số hỏng, mang **VESMART Đà Nẵng** thay và căn chỉnh.

![Con lăn máy Tineco không quay cần tháo kiểm tra](${a})

## Triệu chứng chi tiết

- Con lăn đứng yên dù máy đang hút
- Quay chậm, có mùi nóng
- Kêu “cạch cạch” rồi bảo vệ ngắt
- Chỉ một phía ma sát (lệch ổ bi)
- Báo lỗi brush / roller trên app hoặc đèn

## Nguyên nhân theo mức độ

1. **Tóc / chỉ quấn trục** (hay nhất)
2. **Băng lăn bẩn cứng**, khô keo
3. **Ổ bi kẹt** hoặc thiếu bôi trơn (đúng loại)
4. **Hộp số / bánh răng** gãy răng
5. **Motor con lăn** chết hoặc chổi than mòn (nếu có)
6. **Dây tín hiệu / cảm biến** đứt khi tháo lắp nhiều
7. **Mainboard** không cấp nguồn cho motor roller

![Cắt tóc quấn quanh trục con lăn Tineco](${b})

## Checklist tự xử lý

### Bước 1: Tháo con lăn đúng khóa

Làm theo manual model của bạn. Không dùng lực quá mạnh vào khớp nhựa.

### Bước 2: Cắt tóc quanh hai đầu trục

Dùng kéo nhỏ / dao lưỡi mỏng, cắt song song trục. Không khứa vào vòng bi.

### Bước 3: Giặt và hong khô

Giặt băng lăn, vắt nhẹ, hong khô. Lắp ẩm dễ báo lỗi và sinh mùi.

### Bước 4: Quay tay thử

Trước khi lắp máy, quay tay: phải êm. Nặng một điểm → ổ bi / biến dạng.

### Bước 5: Lắp khớp và test không tải

Bật máy trên đế hoặc tư thế an toàn. Vẫn không quay → ngưng tự sửa điện, mang VESMART.

![Vệ sinh ổ bi và khớp con lăn máy Tineco](${c})

## Việc nên để thợ làm

- Thay motor / hộp số roller
- Căn chỉnh cảm biến hiện diện con lăn
- Kiểm tra dây flat / connector bị đứt
- Test dòng motor khi kẹt giả lập

Tự tháo sâu dễ gãy xương nhựa giữ roller; chi phí nhựa + công có khi cao hơn mang sửa sớm.

## FAQ

### Có dùng con lăn “generic” được không?

Chỉ khi đúng kích thước và khớp điện trở cảm biến (nếu có). Sai loại máy báo lỗi liên tục.

### Con lăn quay nhưng không sạch sàn?

Thiếu nước sạch / bơm yếu / tốc độ thấp do pin. Không nhất thiết hỏng motor roller.

### Bao lâu thay một lần?

Tùy tần suất. Nhà nhiều tóc: kiểm tra mỗi tuần. Băng lăn mòn xơ: thay theo độ bám bẩn thực tế.

![Con lăn Tineco hoạt động lại sau khi bảo dưỡng](${d})

${cta('Sửa con lăn Tineco tại VESMART Đà Nẵng')}
`.trim(),
  },
];

async function collectImageUrls(): Promise<string[]> {
  const rows: ImageRow[] = [];
  for (const slug of PRIMARY_SLUGS) {
    rows.push(...(await urlsFromCategory(prisma, slug)));
  }
  if (rows.length < 5) {
    rows.push(...(await urlsFromCategory(prisma, FALLBACK_IMAGE_CAT)));
  }
  const ordered = preferLandscape(rows);
  const urls = ordered.map((r) => r.url);
  if (urls.length === 0) {
    throw new Error(
      `No images in ${PRIMARY_SLUGS.join(', ')} or ${FALLBACK_IMAGE_CAT}`,
    );
  }
  console.log(
    `Images: primary pooled=${rows.length}, unique-ish list=${urls.length}`,
  );
  return urls;
}

function pickSlice(urls: string[], start: number, count: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(urls[(start + i) % urls.length]);
  }
  return out;
}

async function main() {
  for (const draft of POSTS) {
    assertNoEmDash('title', draft.title);
    assertNoEmDash('summary', draft.summary);
    assertNoEmDash('seoTitle', draft.seoTitle);
    assertNoEmDash('seoDescription', draft.seoDescription);
  }

  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN, deleted_at: null },
    orderBy: { id: 'asc' },
  });
  if (!admin) throw new Error('No ADMIN user found');

  const urls = await collectImageUrls();
  const created: string[] = [];

  for (let i = 0; i < POSTS.length; i++) {
    const draft = POSTS[i];
    const category = await prisma.postCategory.findFirst({
      where: { slug: draft.categorySlug, deleted_at: null },
    });
    if (!category) {
      throw new Error(`Post category ${draft.categorySlug} not found`);
    }

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

    const slice = pickSlice(urls, i * 5, 5);
    const imgs = {
      thumb: slice[0],
      a: slice[1],
      b: slice[2],
      c: slice[3],
      d: slice[4],
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
        published_at: new Date(Date.now() - i * 90_000),
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
    const tinecoImgs = [imgs.thumb, imgs.a, imgs.b, imgs.c, imgs.d].filter(
      (u) => u.includes('/tineco'),
    ).length;
    console.log(`OK #${post.id} ${url} (tineco-path-imgs ~${tinecoImgs}/5)`);
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
