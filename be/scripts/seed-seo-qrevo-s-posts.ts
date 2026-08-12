/**
 * Publish 5 long SEO posts - Roborock Qrevo S (intro + 4 faults) → VESMART.
 * Images: ImageCategory `roborock-qrevo-s`, fallback `chia-se` (VESMART).
 *
 * Usage:
 *   pnpm run prisma:seed-seo-qrevo-s
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
const PRIMARY_CAT_SLUG = 'roborock-qrevo-s';
const FALLBACK_CAT_SLUG = 'chia-se';

type PostDraft = {
  baseSlug: string;
  categorySlug: 'huong-dan' | 'sua-chua' | 'reviews';
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
## Sửa Roborock Qrevo S tại VESMART Đà Nẵng

Nếu đã làm checklist mà **Roborock Qrevo S** vẫn lỗi, mang máy + đế sạc / trạm tới **VESMART** để kiểm tra miễn phí:

- Địa chỉ: ${ADDRESS}
- Điện thoại / Zalo: [${PHONE}](${ZALO})
- Tham khảo [sản phẩm & linh kiện](/products), hỏi trên [diễn đàn](/forum), hoặc đọc thêm [blog sửa chữa](/blog)

*Không mất phí nếu không sửa được. Báo giá trước khi thay linh kiện.*
`.trim();
}

const POSTS: PostDraft[] = [
  {
    baseSlug: 'roborock-qrevo-s-gioi-thieu',
    categorySlug: 'huong-dan',
    title:
      'Roborock Qrevo S là gì? Giới thiệu robot hút lau và cách dùng hiệu quả',
    summary:
      'Tổng quan Roborock Qrevo S: hút lau kép, trạm tự giặt giẻ, mẹo setup map và bảo dưỡng. Khi nào mang sửa tại VESMART Đà Nẵng.',
    seoTitle:
      'Roborock Qrevo S là gì? Giới thiệu & hướng dẫn dùng | VESMART',
    seoDescription:
      'Giới thiệu Roborock Qrevo S: tính năng hút lau, trạm giặt giẻ, setup app. Tư vấn và sửa tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c, d }) => `
**Roborock Qrevo S** là robot hút bụi lau nhà thuộc dòng Qrevo của Roborock: kết hợp hút mạnh, lau đĩa xoay và trạm tự động giặt giẻ / sấy / đổ bụi (tùy cấu hình bộ đế bạn mua). Bài viết giúp bạn hiểu máy phù hợp nhà nào, cách setup lần đầu và bảo dưỡng để ít gặp lỗi.

Nếu bạn ở **Đà Nẵng / miền Trung** và cần tư vấn hoặc sửa **Qrevo S**, **VESMART** hỗ trợ kiểm tra tận nơi cửa hàng.

![Giới thiệu robot hút lau Roborock Qrevo S](${a})

## Roborock Qrevo S hợp nhà nào?

Qrevo S hướng tới căn hộ và nhà phố muốn **vừa hút vừa lau** mà không phải thay giẻ liên tục. Điểm mạnh thường được nhắc tới:

- Lực hút đủ dùng sàn cứng, thảm ngắn
- Hệ lau đĩa xoay, áp lực lau ổn định hơn giẻ kéo thụ động
- Trạm hỗ trợ giặt giẻ, giảm việc vệ sinh tay sau mỗi phiên
- App Roborock: chia vùng, cấm vùng, lịch chạy, mức nước / mức hút

Hạn chế cần biết trước khi mua hoặc khi nhận máy:

- Nhà nhiều dây điện, ghế thấp, đồ chơi nhỏ: dễ kẹt hoặc “chạy loạn” cảm biến
- Thảm dày / lông dài: cần cấu hình tránh vùng hoặc nâng mức hút hợp lý
- Nước cứng / nhiều cặn: bơm nước và đường ống trạm dễ tắc nếu không vệ sinh

![Roborock Qrevo S và trạm sạc giặt giẻ trong nhà](${b})

## Setup lần đầu cho ổn định lâu dài

### 1. Vị trí trạm

- Đặt sát tường phẳng, hai bên và phía trước trống theo khuyến nghị Roborock
- Không kê trên thảm dày hoặc sàn nghiêng
- Nguồn ổn định, tránh ổ kéo dài kém chất lượng
- Không di chuyển trạm sau khi đã lưu map (trừ khi bạn chấp nhận remap)

### 2. Map và vùng

- Cho máy chạy full nhà lần đầu khi nhà gọn, đủ sáng
- Đặt no-go / no-mop quanh dây sạc, chổi, khu vực ướt thường xuyên
- Tách phòng tắm / ban công nếu sàn dễ đọng nước

### 3. Nước và giẻ

- Dùng nước sạch, tránh hóa chất không được hãng khuyến nghị
- Lắp đúng bình nước sạch / bẩn trên trạm
- Kiểm tra giẻ và đĩa lau không lệch trục

![Hướng dẫn setup app và map Roborock Qrevo S](${c})

## Bảo dưỡng định kỳ (giảm 80% lỗi thường gặp)

| Chu kỳ | Việc cần làm |
| --- | --- |
| Sau mỗi 1-2 phiên | Đổ bụi hộp, kiểm tra tóc quấn chổi |
| Hàng tuần | Rửa filter, lau cảm biến, vệ sinh khay giặt giẻ |
| 2-4 tuần | Kiểm tra bơm nước, ống trạm, chân sạc |
| Theo mùa | Cập nhật firmware app Roborock |

Cảm biến LIDAR, tường,Cliff và chân sạc bẩn là nguyên nhân hàng đầu khiến máy **không về trạm** hoặc **chạy loạn**. Giữ sạch trước khi nghi ngờ mainboard.

## Khi nào nên mang Qrevo S tới VESMART?

- Máy mới setup đúng mà vẫn lỗi lặp lại
- Bơm nước / hút nước trạm chết, kêu lạ, chảy nước ra sàn
- Pin tụt nhanh, không sạc, sạc nóng bất thường
- Mainboard / motor hút / module lau báo lỗi phần cứng trên app

Tại VESMART, kỹ thuật viên kiểm tra robot + trạm như một hệ thống (nhiều lỗi “robot” thực chất nằm ở đế).

![Bảo dưỡng và sửa Roborock Qrevo S tại VESMART Đà Nẵng](${d})

${cta()}

## FAQ

**Qrevo S khác Qrevo / Qrevo Pro chỗ nào?**  
Khác chủ yếu ở cấu hình hút, trạm và một số tính năng thông minh. Khi mang sửa, VESMART nhận diện đúng model theo nhãn máy để đặt linh kiện khớp.

**Có cần dùng dung dịch lau chuyên dụng không?**  
Ưu tiên nước sạch hoặc dung dịch Roborock khuyến nghị. Hóa chất mạnh dễ làm hỏng bơm, gioăng và đường ống.

**Firmware có nên cập nhật không?**  
Nên cập nhật khi máy ổn định. Nếu đang lỗi nặng, ghi lại phiên bản rồi mang VESMART kiểm tra trước khi flash thêm.

**Mang cả trạm hay chỉ thân robot?**  
Nên mang cả hai. Lỗi về trạm, ra nước, hút nước thường liên quan đế sạc / module bơm trên trạm.
`.trim(),
  },
  {
    baseSlug: 'roborock-qrevo-s-khong-ve-tram',
    categorySlug: 'sua-chua',
    title:
      'Roborock Qrevo S không về trạm: nguyên nhân và cách khắc phục',
    summary:
      'Qrevo S hết pin giữa nhà, tìm trạm mãi không dock. Checklist map, cảm biến, chân sạc, trạm lệch và sửa tại VESMART Đà Nẵng.',
    seoTitle:
      'Roborock Qrevo S không về trạm - cách sửa | VESMART',
    seoDescription:
      'Roborock Qrevo S không về dock: map lệch, cảm biến bẩn, chân sạc, trạm. Checklist và sửa tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c, d }) => `
**Roborock Qrevo S không về trạm** là lỗi khiến nhiều nhà phải bế máy đặt lên dock mỗi tối. Triệu chứng hay gặp: hết pin giữa nhà, chạy vòng quanh khu vực trạm rồi bỏ đi, app báo “không tìm thấy dock”, hoặc vào sát trạm nhưng không leo lên sạc.

Bài viết đi từ nguyên nhân nhẹ (vệ sinh, map) tới lỗi phần cứng cần **VESMART Đà Nẵng**.

![Roborock Qrevo S không về trạm sạc cần kiểm tra](${a})

## Dấu hiệu nhận biết

- Máy hoàn thành lịch nhưng đứng giữa phòng thay vì dock
- Đến gần trạm rồi lùi ra, xoay nhiều vòng
- Đèn trạm / robot báo lỗi sạc hoặc tiếp xúc
- Pin về 0% ngoài trạm dù nhà không đổi bố cục lớn
- Sau khi di chuyển bàn ghế hoặc trạm, lỗi xuất hiện ngay

## Nguyên nhân thường gặp (theo thứ tự hay gặp)

1. **Trạm bị dịch** sau khi đã lưu map
2. **Chân sạc / tiếp điểm** bẩn, cong, oxi hóa
3. **Cảm biến** (LIDAR, tường, docking) bám bụi mỡ
4. **Map lỗi / đa tầng nhầm** sau khi remap dở
5. **Ngưỡng pin / firmware** khiến máy “sợ” không kịp về
6. **Module định vị / mainboard / nguồn trạm** hỏng

![Vệ sinh chân sạc và cảm biến Roborock Qrevo S](${b})

## Checklist tự xử lý tại nhà

### 1. Cố định lại vị trí trạm

- Đưa trạm về đúng chỗ cũ nếu bạn vừa dọn nhà
- Hai bên trống, không có gương lớn đối diện gây nhiễu LIDAR
- Rút nguồn trạm 30 giây rồi cắm lại

### 2. Lau cảm biến và chân sạc

- Lau kính LIDAR, cảm biến tường, cảm biến chống rơi
- Lau tiếp điểm dưới robot và trên đế bằng khăn khô mềm
- Kiểm tra bánh xe không kẹt tóc (robot lệch hướng khi tiến dock)

### 3. Map và vùng cấm

- Xóa no-go vô tình chắn đường về trạm
- Thử “Locate” / tìm robot trong app, cho chạy về dock thủ công
- Nếu map méo nặng: remap khi nhà gọn, đủ sáng, cửa mở hết các phòng cần phủ

### 4. Firmware và khởi động lại

- Cập nhật app Roborock và firmware máy khi kết nối ổn
- Khởi động lại robot + trạm
- Thử chế độ hút-only trước (ít tải) để xem còn về được không

![Roborock Qrevo S tìm đường về dock bị lệch map](${c})

## Khi nào là lỗi phần cứng?

Cần mang sửa nếu:

- Tiếp điểm cháy đen, biến dạng, robot có tiếng két khi leo dock
- Trạm không cấp nguồn dù đèn / nguồn nhà bình thường
- Máy nhận trạm trên app nhưng không bao giờ hoàn tất docking
- Sau remap + vệ sinh kỹ vẫn lặp lại hàng ngày

Tại **VESMART**, máy được kiểm tra tiếp điểm, board sạc, cảm biến docking, nguồn trạm và chạy thử chu trình về dock nhiều lần trước khi trả.

![Sửa lỗi Roborock Qrevo S không về trạm tại VESMART](${d})

${cta()}

## FAQ

**Chỉ cần bế máy đặt lên trạm mãi được không?**  
Được tạm thời, nhưng pin / mainboard dễ xuống nếu sạc tiếp xúc kém. Nên xử lý dứt điểm.

**Remap có mất vùng cấm không?**  
Thường phải tạo lại no-go / lịch. Nên chụp lại cấu hình app trước khi remap.

**Trạm đổi phòng khác có sao không?**  
Nên remap. Map cũ gắn “ký ức” vị trí dock cũ, dễ khiến Qrevo S không về trạm.

**Còn bảo hành hãng thì sao?**  
Nếu còn bảo hành chính hãng, ưu tiên trung tâm Roborock. Hết bảo hành hoặc cần sửa nhanh khu vực Đà Nẵng: VESMART hỗ trợ.
`.trim(),
  },
  {
    baseSlug: 'roborock-qrevo-s-chay-loan',
    categorySlug: 'sua-chua',
    title:
      'Roborock Qrevo S chạy loạn: nguyên nhân và cách khắc phục',
    summary:
      'Qrevo S chạy vòng vòng, đâm đồ, mất phương hướng. Checklist cảm biến, bánh xe, map nhiễu và sửa tại VESMART Đà Nẵng.',
    seoTitle:
      'Roborock Qrevo S chạy loạn - nguyên nhân & cách sửa | VESMART',
    seoDescription:
      'Roborock Qrevo S chạy loạn, đâm tường, xoay vòng: cảm biến bẩn, bánh xe, map. Sửa tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c, d }) => `
**Roborock Qrevo S chạy loạn** là khi robot không còn đi theo đường có chủ đích: xoay vòng giữa phòng, đâm ghế liên tục, bỏ sót vùng rồi chạy lại chỗ cũ, hoặc “múa” quanh một điểm. Lỗi này vừa ồn vừa dễ xước đồ, thường đến từ cảm biến / bánh xe / map nhiễu hơn là “máy hư hoàn toàn”.

![Roborock Qrevo S chạy loạn cần kiểm tra cảm biến](${a})

## Nhận diện nhanh mức độ lỗi

### Mức nhẹ (tự xử lý được)

- Chỉ loạn ở một góc nhà có gương, chân ghế dày, dây điện
- Sau khi dọn đồ hoặc lau cảm biến thì ổn
- App vẫn lưu map đúng hình nhà

### Mức nặng (nên mang VESMART)

- Loạn mọi phòng, kể cả sàn trống
- LIDAR kêu lạ, chớp lỗi cảm biến trên app
- Bánh xe một bên quay yếu / kẹt khiến máy luôn lệch trái hoặc phải
- Sau factory reset + remap vẫn loạn

## Nguyên nhân phổ biến

1. **LIDAR / cảm biến tường bẩn hoặc dính keo, miếng dán**
2. **Cliff sensor** bị che → máy tưởng vực thẳm, hành vi kỳ lạ
3. **Bánh xe / chổi giữa** quấn tóc lệch lực kéo
4. **Ánh sáng mạnh / gương / kính** gây nhiễu bản đồ
5. **Map chồng chéo** sau nhiều lần remap dở
6. **Mainboard / module LIDAR** lỗi phần cứng

![Lau LIDAR và cảm biến tường Roborock Qrevo S](${b})

## Checklist khắc phục từng bước

### Bước 1: Làm sạch “mắt” robot

- Lau vòm LIDAR (không xịt nước trực tiếp)
- Lau cảm biến quanh thân, cảm biến sát sàn
- Gỡ miếng dán, băng keo, sticker che lỗ cảm biến (hay gặp sau ship)

### Bước 2: Kiểm tra chuyển động cơ

- Lật máy, gỡ tóc ở bánh xe và chổi chính
- Quay thử bánh xe bằng tay: đều, không kẹt
- Chổi góc không cong gập một phía

### Bước 3: Môi trường và map

- Thu dây sạc, thảm có tua, đồ chơi
- Dán no-go quanh khu gương lớn nếu máy hay “ảo”
- Remap một lần sạch khi nhà gọn; tránh remap nhiều lần trong ngày

### Bước 4: Phần mềm

- Cập nhật firmware
- Tắt tạm một số tính năng tránh vật cản AI nếu bản firmware đang lỗi nhận diện (nếu app có tùy chọn)
- Thử chạy theo phòng nhỏ trước khi full nhà

![Map Roborock Qrevo S bị nhiễu khiến robot chạy loạn](${c})

## Phân biệt “chạy loạn” với “không về trạm”

| Hiện tượng | Thường do | Ưu tiên kiểm |
| --- | --- | --- |
| Xoay vòng / đâm đồ | Cảm biến, bánh xe, map | LIDAR, bánh xe |
| Không dock được | Dock, chân sạc, vị trí trạm | Tiếp điểm, map dock |
| Vừa loạn vừa không về | Nhiễu cảm biến nặng hoặc mainboard | VESMART kiểm tra hệ thống |

Nếu máy vừa **chạy loạn** vừa **không về trạm**, đừng chỉ remap mãi: cảm biến hoặc board có thể đang báo sai liên tục.

![Sửa Roborock Qrevo S chạy loạn tại VESMART Đà Nẵng](${d})

${cta()}

## FAQ

**Có nên factory reset ngay?**  
Chỉ sau khi vệ sinh cảm biến và bánh xe. Reset sớm dễ mất map mà lỗi cứng vẫn còn.

**Nhà có nhiều kính có dùng Qrevo S được không?**  
Được, nhưng nên no-go hoặc điều chỉnh bố trí. Kính thấp và gương toàn tường dễ làm LIDAR “nhìn xuyên”.

**Robot đâm chân ghế có phải hỏng bumper?**  
Bumper yếu hoặc kẹt cũng gây điên đảo. Nếu tiếng click bumper mất, mang VESMART kiểm tra công tắc cản.

**Sửa mất bao lâu?**  
Case vệ sinh / cảm biến thường trong ngày. Thay LIDAR hoặc mainboard tùy linh kiện, VESMART báo trước khi làm.
`.trim(),
  },
  {
    baseSlug: 'roborock-qrevo-s-khong-ra-nuoc',
    categorySlug: 'sua-chua',
    title:
      'Roborock Qrevo S không ra nước: nguyên nhân và cách khắc phục',
    summary:
      'Qrevo S lau khô, giẻ không ướt, app báo bơm nước. Checklist bình nước, van, ống, bơm và sửa tại VESMART Đà Nẵng.',
    seoTitle:
      'Roborock Qrevo S không ra nước khi lau - cách sửa | VESMART',
    seoDescription:
      'Roborock Qrevo S không ra nước, giẻ khô: bình nước, lọc, bơm, ống. Checklist và sửa tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c, d }) => `
**Roborock Qrevo S không ra nước** khiến phiên lau gần như vô nghĩa: giẻ khô, sàn chỉ bị chà bụi, hoặc app báo lỗi mực nước / bơm dù bình vẫn còn nước. Với dòng Qrevo, đường nước đi từ bình sạch qua bơm, van và đĩa lau; tắc ở bất kỳ đoạn nào cũng cho triệu chứng “không ra nước”.

![Roborock Qrevo S không ra nước khi lau nhà](${a})

## Triệu chứng thường gặp

- Giẻ lắp đúng nhưng luôn khô sau cả phiên
- Mức nước app để cao vẫn không thấy ẩm sàn
- Nghe tiếng bơm nhưng không có nước tới đĩa lau
- Không nghe tiếng bơm hẳn (bơm chết hoặc không được cấp lệnh)
- Chảy nước rò ở đáy robot / khớp bình (van hở, gioăng)

## Nguyên nhân theo nhóm

### Do sử dụng và vệ sinh

- Bình nước sạch lắp chưa khớp / nắp chưa kín
- Lọc rác / lưới trong bình tắc cặn
- Dùng dung dịch đặc, kết tủa bịt ống
- Giẻ hoặc đĩa lau lắp lệch, kênh nước không khớp

### Do phần cứng

- Bơm nước yếu hoặc cháy
- Van điện / ống silicon gập, nứt
- Cảm biến mực nước báo sai
- Mainboard không cấp nguồn cho bơm

![Kiểm tra bình nước sạch Roborock Qrevo S](${b})

## Checklist tự xử lý (làm lần lượt)

### 1. Bình nước và chế độ lau

- Tháo bình, đổ nước sạch, lắp “click” rõ
- Trong app: bật chế độ lau, tăng mực nước thử
- Xác nhận không để no-mop toàn nhà

### 2. Làm sạch đường nước nhẹ

- Rửa bình và lọc cặn
- Kiểm tra miệng cấp nước không có tóc / màng bẩn
- Chạy chu trình giặt giẻ tại trạm (nếu có) để xả đường ống ngắn

### 3. Giẻ và đĩa lau

- Tháo giẻ, kiểm tra lỗ thoát nước trên đĩa
- Lắp lại đúng chiều, không phồng một bên
- Thử lau một phòng trống để quan sát vệt ẩm

### 4. Loại trừ hóa chất

- Chỉ dùng nước sạch 1-2 phiên thử
- Nếu trước đó đổ dung dịch đặc: xả bình nhiều lần

![Vệ sinh đĩa lau và đường nước Roborock Qrevo S](${c})

## Khi cần sửa tại VESMART

Mang máy tới nếu:

- Không còn tiếng bơm dù app đang lau
- Có tiếng bơm nhưng tuyệt đối không có nước
- Nước rò vào khoang điện / báo lỗi ẩm
- Lỗi lặp sau khi đã rửa bình, thay giẻ, cập nhật firmware

Kỹ thuật viên VESMART đo bơm, van, cảm biến mực nước và kiểm tra mainboard điều khiển lau. Nhiều case chỉ cần thay bơm hoặc thông ống; một số case phải xử lý board.

![Sửa lỗi Roborock Qrevo S không ra nước tại VESMART](${d})

${cta()}

## FAQ

**Lau khô có hại máy không?**  
Không hại ngay, nhưng đĩa lau ma sát khô dễ mòn giẻ và để lại quầng bẩn trên sàn.

**Có được đổ nước lau sàn thông thường không?**  
Hạn chế. Nhiều dung dịch tạo bọt / cặn làm tắc bơm Qrevo S. Hỏi VESMART nếu cần tư vấn dung dịch an toàn.

**Bình đầy mà app báo hết nước?**  
Cảm biến mực nước hoặc tiếp điểm bình bẩn / lỗi. Lau tiếp điểm bình trước; vẫn sai thì mang kiểm tra.

**Chỉ lỗi không ra nước, hút vẫn mạnh thì sao?**  
Đúng hướng nghi ngờ module lau / bơm, không phải motor hút. Vẫn nên mang cả máy để test đồng bộ app.
`.trim(),
  },
  {
    baseSlug: 'roborock-qrevo-s-khong-hut-nuoc',
    categorySlug: 'sua-chua',
    title:
      'Roborock Qrevo S không hút nước: nguyên nhân và cách khắc phục',
    summary:
      'Trạm Qrevo S không hút nước bẩn / giặt giẻ ướt đọng. Checklist khay, bơm hút, ống bẩn và sửa tại VESMART Đà Nẵng.',
    seoTitle:
      'Roborock Qrevo S không hút nước bẩn - cách sửa | VESMART',
    seoDescription:
      'Roborock Qrevo S không hút nước khi giặt giẻ: khay, bơm hút, ống tắc. Checklist và sửa tại VESMART Đà Nẵng.',
    buildContent: ({ a, b, c, d }) => `
**Roborock Qrevo S không hút nước** thường gắn với trạm: sau khi giặt giẻ, nước bẩn không được hút lên bình / khay, đáy trạm đọng nước, có mùi, hoặc app báo lỗi thoát nước. Khác với lỗi **không ra nước** (không cấp nước sạch xuống giẻ), lỗi này nằm ở **bơm hút / đường ống phía nước bẩn**.

![Roborock Qrevo S không hút nước bẩn tại trạm](${a})

## Dấu hiệu cụ thể

- Khay giặt giẻ ngập nước sau chu trình
- Bình nước bẩn không tăng mực dù vừa giặt giẻ
- Sàn quanh trạm bị ướt, chảy lan
- Nghe tiếng bơm hút yếu, ngắt quãng hoặc không chạy
- App báo tắc ống, lỗi trạm, hoặc giặt giẻ thất bại

## Vì sao Qrevo S hay gặp lỗi hút nước?

Trạm phải hút nước bẩn có **xơ giẻ, bụi, lông**. Lưới lọc và ống hẹp tắc rất nhanh nếu:

- Không đổ bình bẩn đúng chu kỳ
- Giặt giẻ bằng nước có nhiều bùn / đất sau ngày mưa
- Để trạm lâu không vệ sinh khay
- Bơm hút mòn cánh hoặc kẹt dị vật

![Vệ sinh khay giặt giẻ trạm Roborock Qrevo S](${b})

## Checklist xử lý tại nhà

### 1. Bình nước bẩn và khay

- Tháo bình bẩn, đổ hết, rửa sạch
- Tháo khay giặt giẻ (nếu model cho phép), cọ lắng cặn
- Kiểm tra gioăng bình không biến dạng

### 2. Lưới lọc và ống hút

- Lấy dị vật ở miệng hút trong khay
- Thông đoạn ống mềm nếu thấy xẹp / gập khi lắp lại
- Không dùng que cứng chọc mạnh vào cánh bơm

### 3. Chạy thử chu trình

- Đổ ít nước sạch vào khay (theo hướng dẫn an toàn của bạn, lượng nhỏ)
- Chạy lệnh giặt giẻ / thoát nước trên app
- Quan sát: có hút không, bình bẩn có lên mực không

### 4. Nguồn và firmware trạm

- Rút nguồn trạm 30 giây
- Kiểm tra robot đặt đúng vị trí khi giặt giẻ (lệch dock → hút kém)
- Cập nhật firmware nếu có bản sửa lỗi trạm

![Ống và bơm hút nước bẩn Roborock Qrevo S](${c})

## Phân biệt nhanh với lỗi không ra nước

| Lỗi | Bạn thấy gì | Bộ phận nghi ngờ |
| --- | --- | --- |
| Không ra nước | Giẻ khô khi lau nhà | Bơm cấp, bình sạch, van |
| Không hút nước | Khay / sàn trạm ướt sau giặt giẻ | Bơm hút, ống, bình bẩn |
| Cả hai | Lau khô + trạm ngập | Hệ nước tổng / board trạm |

Nếu **cả không ra nước lẫn không hút nước**, ưu tiên mang nguyên bộ robot + trạm tới VESMART để tránh thay nhầm linh kiện.

## Khi nào cần kỹ thuật viên?

- Bơm hút không chạy hoặc kêu gào rồi cắt
- Ống nứt, nước vào khoang điện trạm
- Lỗi lặp sau khi đã vệ sinh khay / bình kỹ
- Trạm báo lỗi phần cứng trên app

VESMART kiểm tra bơm hút, cảm biến mực nước bẩn, board trạm và chạy thử nhiều chu trình giặt - hút - sấy (nếu có) trước khi bàn giao.

![Sửa Roborock Qrevo S không hút nước tại VESMART Đà Nẵng](${d})

${cta()}

## FAQ

**Có được tự thay bơm hút không?**  
Chỉ khi bạn có linh kiện đúng model và kinh nghiệm. Sai gioăng dễ rò nước vào điện. An toàn hơn để VESMART làm.

**Cứ chà khay mỗi tuần có hết lỗi không?**  
Giảm tắc rất nhiều, nhưng bơm đã yếu thì vệ sinh chỉ kéo dài thêm ít ngày.

**Robot vẫn lau bình thường mà trạm không hút thì dùng tiếp được không?**  
Có thể lau tạm, nhưng khay ngập sẽ bẩn và có mùi, dễ tràn. Nên sửa sớm.

**Mang cả robot hay chỉ trạm?**  
Nên mang cả hai. Một số lệnh hút / giặt phụ thuộc robot ngồi đúng dock và tín hiệu app.
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

function sortPreferLandscape(
  rows: { url: string; width: number | null; height: number | null }[],
) {
  const landscape = rows.filter(
    (r) => r.width != null && r.height != null && r.width >= r.height,
  );
  const rest = rows.filter((r) => !landscape.includes(r));
  return [...landscape, ...rest];
}

async function pickImages(count: number) {
  const primary = sortPreferLandscape(await urlsFromCategory(PRIMARY_CAT_SLUG));
  const fallback = sortPreferLandscape(await urlsFromCategory(FALLBACK_CAT_SLUG));
  if (primary.length === 0 && fallback.length === 0) {
    throw new Error(`No images in ${PRIMARY_CAT_SLUG} or ${FALLBACK_CAT_SLUG}`);
  }

  // Interleave so each post (5 slots) gets primary coverage when pool is small.
  const perPost = 5;
  const posts = Math.ceil(count / perPost);
  const out: string[] = [];
  let p = 0;
  let f = 0;
  for (let postIdx = 0; postIdx < posts; postIdx++) {
    const primaryPerPost = primary.length > 0 ? Math.min(2, primary.length) : 0;
    for (let k = 0; k < primaryPerPost; k++) {
      out.push(primary[p % primary.length].url);
      p += 1;
    }
    while (out.length < (postIdx + 1) * perPost) {
      const row = fallback.length > 0 ? fallback[f % fallback.length] : primary[p % primary.length];
      out.push(row.url);
      if (fallback.length > 0) f += 1;
      else p += 1;
    }
  }
  const sliced = out.slice(0, count);
  console.log(
    `Images: primary=${primary.length}, fallback=${fallback.length}, using=${sliced.length} (interleaved)`,
  );
  return sliced;
}

async function main() {
  for (const draft of POSTS) {
    assertNoEmDash('title', draft.title);
    assertNoEmDash('summary', draft.summary);
    assertNoEmDash('seoTitle', draft.seoTitle);
    assertNoEmDash('seoDescription', draft.seoDescription);
  }

  const categories = await prisma.postCategory.findMany({
    where: { deleted_at: null },
  });
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));

  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN, deleted_at: null },
    orderBy: { id: 'asc' },
  });
  if (!admin) throw new Error('No ADMIN user found');

  const urls = await pickImages(POSTS.length * 5);
  const created: string[] = [];

  for (let i = 0; i < POSTS.length; i++) {
    const draft = POSTS[i];
    const postCat = catBySlug.get(draft.categorySlug);
    if (!postCat) throw new Error(`Post category ${draft.categorySlug} not found`);

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
        category: { connect: { id: postCat.id } },
      },
    });

    const finalSlug = `${draft.baseSlug}-${post.id}`;
    await prisma.post.update({
      where: { id: post.id },
      data: { slug: finalSlug },
    });

    const url = `${SITE}/blog/${finalSlug}`;
    const qrevoImgs = [imgs.thumb, imgs.a, imgs.b, imgs.c, imgs.d].filter((u) =>
      u.includes('/roborock-qrevo-s/'),
    ).length;
    console.log(`OK #${post.id} ${url} (qrevo-imgs ${qrevoImgs}/5)`);
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
