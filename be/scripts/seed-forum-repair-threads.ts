/**
 * Seed 10 lively repair forum threads + VN users + technical replies.
 * Creates brand forums under category robot-hut-bui if missing.
 *
 * Usage:
 *   pnpm run prisma:seed-forum-repair
 */
import {
  PrismaClient,
  ThreadStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { assertNoEmDash, loadEnvFile } from './lib/seo-seed';

loadEnvFile();

const prisma = new PrismaClient();
const BATCH = 'forum-repair-v1';

type UserSeed = {
  username: string;
  fullName: string;
  email: string;
};

type ReplySeed = {
  author: string;
  content: string;
  /** minutes after thread created */
  afterMin: number;
};

type ThreadSeed = {
  baseSlug: string;
  forumSlug: string;
  author: string;
  title: string;
  content: string;
  views: number;
  replies: ReplySeed[];
};

const USERS: UserSeed[] = [
  {
    username: 'minh_danang',
    fullName: 'Nguyễn Văn Minh',
    email: 'minh.danang.forum@vesmart.local',
  },
  {
    username: 'thuy_robot',
    fullName: 'Trần Thị Thủy',
    email: 'thuy.robot.forum@vesmart.local',
  },
  {
    username: 'anhquan92',
    fullName: 'Lê Anh Quân',
    email: 'anhquan92.forum@vesmart.local',
  },
  {
    username: 'lanphuong_hn',
    fullName: 'Phạm Lan Phương',
    email: 'lanphuong.forum@vesmart.local',
  },
  {
    username: 'duc_suamay',
    fullName: 'Hoàng Đức',
    email: 'duc.suamay.forum@vesmart.local',
  },
  {
    username: 'hung_roborock',
    fullName: 'Võ Thanh Hùng',
    email: 'hung.roborock.forum@vesmart.local',
  },
  {
    username: 'mai_ecovacs',
    fullName: 'Đặng Thị Mai',
    email: 'mai.ecovacs.forum@vesmart.local',
  },
  {
    username: 'tuan_camle',
    fullName: 'Bùi Quốc Tuấn',
    email: 'tuan.camle.forum@vesmart.local',
  },
  {
    username: 'khoa_kythuat',
    fullName: 'Ngô Anh Khoa',
    email: 'khoa.kythuat.forum@vesmart.local',
  },
  {
    username: 'vananh88',
    fullName: 'Lý Vân Anh',
    email: 'vananh88.forum@vesmart.local',
  },
  {
    username: 'phuong_smarthome',
    fullName: 'Đỗ Thanh Phương',
    email: 'phuong.smarthome.forum@vesmart.local',
  },
  {
    username: 'bao_haichau',
    fullName: 'Trịnh Quốc Bảo',
    email: 'bao.haichau.forum@vesmart.local',
  },
];

const FORUMS = [
  {
    slug: 'ecovacs',
    name: 'Ecovacs',
    description: 'Thảo luận robot Ecovacs: lỗi, sửa chữa, kinh nghiệm dùng',
  },
  {
    slug: 'roborock',
    name: 'Roborock',
    description: 'Thảo luận Roborock Qrevo / S7 / S8: sửa chữa và mua bán góp ý',
  },
  {
    slug: 'dreame',
    name: 'Dreame',
    description: 'Cộng đồng Dreame: bảo dưỡng, lỗi pin, phụ kiện',
  },
];

/** Placeholders {{t:baseSlug}} replaced after all threads exist. */
const THREADS: ThreadSeed[] = [
  {
    baseSlug: 'ecovacs-x1-omni-khong-ve-tram-hoi',
    forumSlug: 'ecovacs',
    author: 'mai_ecovacs',
    title: 'X1 OMNI hết pin giữa nhà, không chịu về trạm?',
    views: 186,
    content: `Nhà mình dùng X1 OMNI được 8 tháng. Dạo này hay **đứng giữa phòng** dù pin còn 20%. Có hôm chạy vòng quanh trạm rồi bỏ đi.

Đã lau chân sạc + cảm biến. Map vẫn bình thường. Anh em gặp chưa? Có nên mang VESMART kiểm tra tiếp điểm không?

Update: trạm không bị dịch chỗ.`,
    replies: [
      {
        author: 'khoa_kythuat',
        afterMin: 40,
        content: `Hay gặp. Ưu tiên check:

1. Tiếp điểm dưới robot có oxi hóa không
2. Bánh xe có lệch lực (tóc quấn một bên)
3. Thử **Locate → Dock** trên app

Nếu vào sát dock rồi lùi ra liên tục thì nghi tiếp điểm hoặc cảm biến docking hơn là map.`,
      },
      {
        author: 'minh_danang',
        afterMin: 95,
        content: `Mình cũng bị. Lau chân sạc chưa hết, mang VESMART họ bảo **tiếp điểm cong nhẹ**. Chỉnh lại là về ổn.

Bạn ở Đà Nẵng thì nên mang cả trạm luôn cho nhanh.`,
      },
      {
        author: 'anhquan92',
        afterMin: 180,
        content: `Thêm case: sau khi dọn nhà dịch sofa, LIDAR “nhớ” đường cũ. Remap 1 lần sạch thường hết. Còn oxi hóa thì remap không cứu được.`,
      },
      {
        author: 'mai_ecovacs',
        afterMin: 260,
        content: `Cảm ơn anh em. Mình sẽ thử remap tối nay, không được thì cuối tuần mang VESMART. Update sau nhé.`,
      },
    ],
  },
  {
    baseSlug: 'roborock-qrevo-s-chay-loan-hoi',
    forumSlug: 'roborock',
    author: 'hung_roborock',
    title: 'Qrevo S chạy loạn, xoay vòng giữa phòng sau khi dọn nhà',
    views: 214,
    content: `Hôm qua dọn nhà, kê lại bàn ghế. Từ đó Qrevo S **xoay vòng**, đâm chân ghế liên tục, map trên app hơi méo.

Đã lau LIDAR. Firmware mới nhất. Có ai bị giống không? Remap luôn hay kiểm tra bánh xe trước?

Liên quan lỗi về trạm cũng đang sợ dính (thấy thread Ecovacs bên kia hơi giống triệu chứng cảm biến).`,
    replies: [
      {
        author: 'duc_suamay',
        afterMin: 25,
        content: `Dọn nhà xong mà loạn → **90% do map + môi trường**, chưa hẳn hỏng.

Thứ tự mình hay bảo khách:
1. Gỡ tóc bánh xe / chổi
2. Lau LIDAR + cliff
3. Remap khi nhà gọn, đủ sáng

Chưa cần tháo mainboard vội.`,
      },
      {
        author: 'khoa_kythuat',
        afterMin: 70,
        content: `Đúng hướng của bác Đức. Thêm: gương lớn / kính thấp làm LIDAR “ảo” lắm. Đặt no-go tạm quanh khu đó thử 1 phiên.

Nếu loạn cả sàn trống thì lúc đó mới nghi module LIDAR.`,
      },
      {
        author: 'thuy_robot',
        afterMin: 140,
        content: `Nhà mình Qrevo S cũng loạn sau khi chuyển trạm. Remap xong ổn. Nhớ **đừng remap 3-4 lần một ngày**, map dễ chồng.`,
      },
      {
        author: 'hung_roborock',
        afterMin: 200,
        content: `Update: gỡ tóc bánh trái khá nhiều + remap. Máy đi thẳng lại rồi. Cảm ơn cả nhà!`,
      },
    ],
  },
  {
    baseSlug: 'nen-mua-qrevo-s-hay-x1-omni-cu',
    forumSlug: 'roborock',
    author: 'phuong_smarthome',
    title: 'Nên mua Qrevo S mới hay X1 OMNI cũ tầm 8-9 triệu?',
    views: 268,
    content: `Nhà 70m², gạch men + 1 thảm ngắn. Đang phân vân:

- **Qrevo S mới** (trạm giặt giẻ)
- **X1 OMNI cũ** (người bán bảo mới thay giẻ, pin còn tốt)

Ưu tiên ít phải vệ sinh tay. Anh em dùng thực tế góp ý với. Có sợ máy cũ lỗi về trạm / bơm nước không?`,
    replies: [
      {
        author: 'vananh88',
        afterMin: 30,
        content: `Cùng diện tích mình chọn **Qrevo S mới** cho yên tâm bảo hành. X1 OMNI cũ ngon nhưng hay dính case tiếp điểm / trạm OMNI nếu người bán không maintain.`,
      },
      {
        author: 'mai_ecovacs',
        afterMin: 55,
        content: `X1 OMNI lau hút vẫn mạnh. Nhưng nếu mua cũ, ép test: về dock 3 lần, giặt giẻ, hút nước bẩn. Máy mình từng lỗi về trạm, nhờ forum mới biết mang VESMART.`,
      },
      {
        author: 'khoa_kythuat',
        afterMin: 110,
        content: `Góc kỹ thuật:

- Nhà muốn **ít chạm tay** → ưu tiên trạm giặt giẻ khỏe + còn bảo hành
- Máy cũ: hỏi rõ đã thay **bơm / filter / pin** chưa
- Ngân sách 8-9tr: Qrevo S mới thường an toàn hơn X1 “lãi bề ngoài”

Nếu mua cũ, dẫn tới chỗ sửa uy tín test giúp trước khi chốt.`,
      },
      {
        author: 'bao_haichau',
        afterMin: 160,
        content: `Mình đang X1 OMNI năm 2. Vẫn ổn nếu bảo dưỡng. Còn thích máy mới ít rủi ro thì Qrevo S. Đừng mua máy cũ không cho test tại chỗ.`,
      },
      {
        author: 'phuong_smarthome',
        afterMin: 220,
        content: `Chốt nghiêng Qrevo S mới. Cảm ơn mọi người, tối đi xem máy luôn.`,
      },
    ],
  },
  {
    baseSlug: 'dreame-pin-tut-nhanh',
    forumSlug: 'dreame',
    author: 'tuan_camle',
    title: 'Dreame pin tụt nhanh, chạy được 25 phút là về?',
    views: 142,
    content: `Dreame của mình trước hút full nhà ~55 phút. Giờ ~25 phút đã kéo về dock, app còn báo 40% là lạ.

Đã thay filter. Có phải pin chai hay board báo sai %? Có nên cân cell không?`,
    replies: [
      {
        author: 'duc_suamay',
        afterMin: 35,
        content: `% trên app **không phải lúc nào cũng đúng** khi cell lệch. Dấu hiệu chai thật:

- Máy tụt % nhanh ở giữa phiên
- Nóng đáy khi sạc
- Về dock sớm dù map chưa xong

25 phút với nhà to là hơi ngắn. Nên đo dòng xả hoặc mang shop test pin.`,
      },
      {
        author: 'anhquan92',
        afterMin: 90,
        content: `Nhà mình cũng Dreame, filter bẩn làm motor kéo tải → tụt pin nhanh hơn. Bạn đã rửa **filter + hộp bụi + ống** chưa? Thử sạch hết rồi chạy lại 1 vòng calibrate.`,
      },
      {
        author: 'khoa_kythuat',
        afterMin: 150,
        content: `Đồng ý làm sạch trước. Nếu vẫn 25 phút: nghi **pack pin** hoặc cảm biến nhiên liệu trên board.

Tự cân cell nếu không có dụng cụ + hiểu BMS thì dễ chết board. Nên để thợ làm.`,
      },
      {
        author: 'tuan_camle',
        afterMin: 240,
        content: `Rửa kỹ filter thấy thêm được ~10 phút. Vẫn chưa như trước. Cuối tuần mang VESMART đo pin vậy.`,
      },
    ],
  },
  {
    baseSlug: 'robot-hut-yeu-da-rua-filter',
    forumSlug: 'ecovacs',
    author: 'lanphuong_hn',
    title: 'Robot hút yếu dù đã rửa filter, có phải motor?',
    views: 175,
    content: `Ecovacs nhà mình hút kém rõ: tóc trên gạch còn nguyên. Filter đã rửa + phơi khô 24h. Chổi giữa còn mới.

Nghe motor vẫn ồn. Có thể tắc ống / cyclone hay bắt đầu hỏng motor? Mua chổi mới có giúp không?`,
    replies: [
      {
        author: 'khoa_kythuat',
        afterMin: 20,
        content: `Đừng kết luận motor sớm. Checklist:

1. Hộp bụi lắp khít chưa (hở gioăng = mất hút)
2. Ống từ chổi lên hộp có tóc bịt không
3. Cyclone / lưới phụ (nếu có) bám bụi mịn
4. Chổi góc mòn đẩy rác kém (khác chuyện lực hút)

Motor hỏng thường kèm tiếng dị / mùi khét / báo lỗi quạt.`,
      },
      {
        author: 'mai_ecovacs',
        afterMin: 75,
        content: `Nhà mình hút yếu vì **gioăng hộp bụi** hơi lệch sau lần tháo. Chỉnh lại cái “click” là mạnh lại. Bạn thử nghe gió ở miệng hút khi máy nâng lên (cẩn thận tay).`,
      },
      {
        author: 'minh_danang',
        afterMin: 130,
        content: `Nếu gió yếu thật sau khi check gioăng thì mang đo. VESMART từng báo case cánh quạt gãy một phần, bên ngoài vẫn ồn bình thường.`,
      },
      {
        author: 'lanphuong_hn',
        afterMin: 190,
        content: `Phát hiện tóc bịt ống khá dai. Thông xong hút khá hơn. Chưa chắc phải thay motor. Cảm ơn!`,
      },
    ],
  },
  {
    baseSlug: 'qrevo-s-khong-ra-nuoc-lau',
    forumSlug: 'roborock',
    author: 'vananh88',
    title: 'Qrevo S lau khô, không ra nước dù bình còn đầy',
    views: 198,
    content: `App để mực nước cao, bình sạch còn nửa bình mà **giẻ luôn khô**. Có lúc nghe tiếng bơm 1-2 giây rồi im.

Đã rửa bình, không đổ dung dịch lạ. Anh em bảo thông ống hay thay bơm luôn?`,
    replies: [
      {
        author: 'duc_suamay',
        afterMin: 28,
        content: `Triệu chứng điển hình **bơm yếu / van / ống tắc nhẹ**.

Thử:
- Chỉ dùng nước sạch
- Lắp bình “click” rõ
- Tháo đĩa lau xem lỗ cấp nước có cặn
- Chạy giặt giẻ tại trạm xem còn cấp nước không

Có tiếng bơm ngắn rồi tắt: có thể board cắt vì áp suất / cảm biến.`,
      },
      {
        author: 'hung_roborock',
        afterMin: 80,
        content: `Mình bị giống. Cặn trắng trong bình (nước cứng Đà Nẵng). Ngâm bình + xả đường nước vài lần là ra lại. Chưa phải thay bơm.`,
      },
      {
        author: 'khoa_kythuat',
        afterMin: 145,
        content: `Nếu sau khi vệ sinh vẫn khô: đo bơm. Đừng tự chọt ống bằng que cứng, dễ thủng silicone.

Nhầm với lỗi **không hút nước** (trạm ngập) nhé, hai hướng khác nhau.`,
      },
      {
        author: 'vananh88',
        afterMin: 210,
        content: `Update: có cặn ở miệng cấp nước đĩa lau. Vệ sinh xong đã ẩm trở lại. Để quan sát thêm 2-3 ngày.`,
      },
    ],
  },
  {
    baseSlug: 'tu-thay-choi-ecovacs-co-nen',
    forumSlug: 'ecovacs',
    author: 'bao_haichau',
    title: 'Tự thay chổi Ecovacs trên Shopee có sao không?',
    views: 156,
    content: `Chổi chính mòn. Thấy chổi generic rẻ bằng 1/2 hàng hãng. Anh em tự thay được không? Có rủi ro kẹt motor / lệch trục không?

Có nên ra VESMART mua đúng model cho chắc?`,
    replies: [
      {
        author: 'mai_ecovacs',
        afterMin: 22,
        content: `Tự thay được, 5-10 phút. Quan trọng là **đúng model** (trục / chiều dài / loại cao su). Generic lệch size dễ kêu và quấn tóc nhiều hơn.`,
      },
      {
        author: 'khoa_kythuat',
        afterMin: 60,
        content: `Đồng ý. Hàng kém hay:

- Cao su cứng → đẩy rác kém
- Bac đỡ lệch → rung, tải motor chổi
- Không có khớp chống rối (nếu máy hỗ trợ)

Nếu không rõ mã máy, mang chổi cũ ra shop đối là an toàn nhất.`,
      },
      {
        author: 'anhquan92',
        afterMin: 100,
        content: `Mình từng mua nhầm chổi Tên gần giống. Lắp được nhưng hút méo. Lần sau chỉ mua theo mã trên app / tem máy.`,
      },
      {
        author: 'bao_haichau',
        afterMin: 170,
        content: `Ok, mình chụp tem máy rồi hỏi VESMART lấy đúng loại. Cảm ơn anh em.`,
      },
    ],
  },
  {
    baseSlug: 'tram-sac-nong-bat-thuong',
    forumSlug: 'dreame',
    author: 'thuy_robot',
    title: 'Trạm sạc Dreame nóng bất thường, có nguy hiểm không?',
    views: 133,
    content: `Lúc sạc thấy **đế nóng rõ**, robot đáy cũng ấm. Không có mùi khét. App không báo lỗi.

Có bình thường không hay nên ngắt nguồn? Sợ phù nguồn / tiếp điểm.`,
    replies: [
      {
        author: 'khoa_kythuat',
        afterMin: 18,
        content: `Ấm nhẹ khi sạc nhanh / sạc đầy cuối là hay gặp. **Nóng cầm không để lâu được** hoặc nóng kèm mùi thì ngắt ngay.

Check:
- Tiếp điểm bẩn / tiếp xúc ảo (nhiệt tăng)
- Ổ điện kém, dây nối dài mỏng
- Robot có ngồi lệch dock không`,
      },
      {
        author: 'duc_suamay',
        afterMin: 55,
        content: `Khách mình từng tiếp điểm oxi hóa → trở kháng cao → nóng. Lau xong mát hẳn. Đừng để chạy overnight nếu đang nóng lạ.`,
      },
      {
        author: 'tuan_camle',
        afterMin: 120,
        content: `Nhà mình trước cũng sợ. Mang test thì pin vẫn ổn, chỉ cần vệ sinh chân sạc. Bạn thử đo nhiệt sau 30 phút sạc xem.`,
      },
      {
        author: 'thuy_robot',
        afterMin: 200,
        content: `Lau chân sạc thấy hơi đen. Đang sạc lại thấy dịu hơn. Nếu tái phát mình mang shop luôn.`,
      },
    ],
  },
  {
    baseSlug: 'map-lech-sau-cap-nhat-firmware',
    forumSlug: 'roborock',
    author: 'anhquan92',
    title: 'Update firmware xong map lệch, máy nhận nhầm phòng',
    views: 161,
    content: `Qrevo S update firmware tối qua. Sáng nay map **xoay lệch**, phòng khách thành “phòng lạ”, lịch chạy sai cửa.

Có nên xóa map luôn không? Có ai bị sau bản mới không?`,
    replies: [
      {
        author: 'hung_roborock',
        afterMin: 33,
        content: `Bản firmware đôi khi làm lệch metadata map. Mình bị 1 lần: **xóa map → remap 1 phát** là xong. Backup no-go bằng screenshot trước khi xóa.`,
      },
      {
        author: 'khoa_kythuat',
        afterMin: 85,
        content: `Đúng quy trình. Không nên “sửa map tay” mãi khi đã xoay trục.

Sau remap:
- Đặt lại vùng cấm
- Chạy thử 1 phòng trước khi full nhà
- Trạm giữ nguyên chỗ cũ`,
      },
      {
        author: 'phuong_smarthome',
        afterMin: 140,
        content: `Liên quan thread chạy loạn: mình remap xong cũng hết nhận nhầm phòng. Có vẻ firmware + map cũ xung đột.`,
      },
      {
        author: 'anhquan92',
        afterMin: 195,
        content: `Remap xong đẹp rồi. Nhớ screenshot vùng cấm trước quả thật cứu mạng. Thanks!`,
      },
    ],
  },
  {
    baseSlug: 'goi-y-sua-robot-da-nang-vesmart',
    forumSlug: 'ecovacs',
    author: 'minh_danang',
    title: 'Gợi ý chỗ sửa robot hút bụi Đà Nẵng uy tín?',
    views: 247,
    content: `Mình cần chỗ **test + sửa** robot (Ecovacs / Roborock đều có trong nhà). Muốn báo giá trước, không sửa thì không lấy phí.

Anh em Đà Nẵng gửi máy ở đâu? Nghe nhiều bạn mention VESMART, thực tế sao?`,
    replies: [
      {
        author: 'bao_haichau',
        afterMin: 15,
        content: `Mình gửi VESMART bên Trưng Nữ Vương. Kiểm tra pin + chân sạc rõ ràng, báo giá trước. Lần đó không phải thay vẫn chỉ vệ sinh + chỉnh tiếp điểm.`,
      },
      {
        author: 'duc_suamay',
        afterMin: 50,
        content: `Góc thợ: chỗ tốt là chỗ **nhận cả robot lẫn trạm**, vì nhiều lỗi “máy hư” nằm ở đế / bơm.

Hỏi trước: có test về dock, bơm nước, hút nước bẩn không.`,
      },
      {
        author: 'mai_ecovacs',
        afterMin: 95,
        content: `X1 của mình sửa về trạm ở đó ổn. Zalo phản hồi nhanh. Nhớ mang theo dock.`,
      },
      {
        author: 'vananh88',
        afterMin: 130,
        content: `Qrevo S nhà mình cũng hỏi họ vụ không ra nước. Được hướng dẫn vệ sinh trước, hết thì khỏi tốn tiền thay bơm.`,
      },
      {
        author: 'khoa_kythuat',
        afterMin: 175,
        content: `Tóm lại checklist trước khi mang đi:

- Mô tả triệu chứng + video 15s
- Mang robot + trạm + hộp bụi / bình nước
- Nói rõ đã tự làm bước nào (rửa filter, remap…)

Tránh chỗ nhận máy rồi im dài ngày không báo lỗi.`,
      },
      {
        author: 'minh_danang',
        afterMin: 230,
        content: `Thanks cả nhà. Cuối tuần mình mang bộ Ecovacs qua VESMART test. Sẽ về update đúng lỗi luôn.`,
      },
    ],
  },
];

async function ensureForums() {
  const category = await prisma.forumCategory.findFirst({
    where: { slug: 'robot-hut-bui', deleted_at: null },
  });
  if (!category) {
    throw new Error('Forum category robot-hut-bui not found');
  }
  const map = new Map<string, number>();
  for (let i = 0; i < FORUMS.length; i++) {
    const f = FORUMS[i];
    const row = await prisma.forum.upsert({
      where: { slug: f.slug },
      update: {
        name: f.name,
        description: f.description,
        deleted_at: null,
        category_id: category.id,
      },
      create: {
        name: f.name,
        slug: f.slug,
        description: f.description,
        sort_order: i + 1,
        category: { connect: { id: category.id } },
      },
    });
    map.set(f.slug, row.id);
  }
  return map;
}

async function ensureUsers(passwordHash: string) {
  const map = new Map<string, number>();
  for (const u of USERS) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: u.username }, { email: u.email }],
      },
    });
    if (existing) {
      map.set(u.username, existing.id);
      continue;
    }
    const created = await prisma.user.create({
      data: {
        username: u.username,
        email: u.email,
        full_name: u.fullName,
        password: passwordHash,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      },
    });
    map.set(u.username, created.id);
    console.log(`USER ${u.username} #${created.id}`);
  }
  return map;
}

function linkify(content: string, slugByBase: Map<string, string>) {
  return content.replace(/\{\{t:([a-z0-9-]+)\}\}/g, (_m, base: string) => {
    const slug = slugByBase.get(base);
    if (!slug) return `/forum`;
    return `/forum/threads/${slug}`;
  });
}

async function main() {
  for (const t of THREADS) {
    assertNoEmDash(t.title, t.title);
    assertNoEmDash(t.baseSlug, t.content);
    for (const r of t.replies) assertNoEmDash(`${t.baseSlug}:${r.author}`, r.content);
  }

  const passwordHash = await bcrypt.hash('VesmartForum!2026', 10);
  const forumIds = await ensureForums();
  const userIds = await ensureUsers(passwordHash);

  const slugByBase = new Map<string, string>();
  const createdUrls: string[] = [];

  // Pass 1: create threads (idempotent)
  for (let i = 0; i < THREADS.length; i++) {
    const draft = THREADS[i];
    const forumId = forumIds.get(draft.forumSlug);
    const authorId = userIds.get(draft.author);
    if (!forumId || !authorId) {
      throw new Error(`Missing forum/user for ${draft.baseSlug}`);
    }

    let thread = await prisma.thread.findFirst({
      where: {
        forum_id: forumId,
        deleted_at: null,
        OR: [
          { slug: { startsWith: `${draft.baseSlug}-` } },
          { slug: draft.baseSlug },
        ],
      },
    });

    const createdAt = new Date(Date.now() - (THREADS.length - i) * 3 * 60 * 60 * 1000);

    if (!thread) {
      thread = await prisma.thread.create({
        data: {
          title: draft.title,
          slug: `${draft.baseSlug}-tmp-${Date.now()}`,
          content: draft.content,
          views: draft.views,
          status: ThreadStatus.OPEN,
          created_at: createdAt,
          updated_at: createdAt,
          forum: { connect: { id: forumId } },
          user: { connect: { id: authorId } },
          seo_title: draft.title,
          seo_description: draft.content.replace(/\s+/g, ' ').slice(0, 150),
        },
      });
      const finalSlug = `${draft.baseSlug}-${thread.id}`;
      thread = await prisma.thread.update({
        where: { id: thread.id },
        data: { slug: finalSlug },
      });
      console.log(`THREAD #${thread.id} ${finalSlug}`);
    } else {
      console.log(`SKIP thread #${thread.id} ${thread.slug}`);
    }

    slugByBase.set(draft.baseSlug, thread.slug);
    createdUrls.push(`https://vesmart.vn/forum/threads/${thread.slug}`);
  }

  // Pass 2: cross-link blurbs + replies
  const crossLinks: Record<string, string> = {
    'ecovacs-x1-omni-khong-ve-tram-hoi': `Ai đang phân vân máy cũ cũng xem thêm: {{t:nen-mua-qrevo-s-hay-x1-omni-cu}}`,
    'roborock-qrevo-s-chay-loan-hoi': `Nếu loạn sau update firmware, xem thêm: {{t:map-lech-sau-cap-nhat-firmware}}`,
    'nen-mua-qrevo-s-hay-x1-omni-cu': `Case lỗi thực tế để cân nhắc máy cũ: {{t:ecovacs-x1-omni-khong-ve-tram-hoi}} và {{t:qrevo-s-khong-ra-nuoc-lau}}`,
    'qrevo-s-khong-ra-nuoc-lau': `Đừng nhầm với lỗi hút nước trạm. Cần chỗ test thì xem: {{t:goi-y-sua-robot-da-nang-vesmart}}`,
    'goi-y-sua-robot-da-nang-vesmart': `Một số case anh em đang hỏi: {{t:ecovacs-x1-omni-khong-ve-tram-hoi}}, {{t:qrevo-s-khong-ra-nuoc-lau}}, {{t:dreame-pin-tut-nhanh}}`,
  };

  for (let i = 0; i < THREADS.length; i++) {
    const draft = THREADS[i];
    const forumId = forumIds.get(draft.forumSlug)!;
    const thread = await prisma.thread.findFirst({
      where: {
        forum_id: forumId,
        slug: slugByBase.get(draft.baseSlug),
        deleted_at: null,
      },
    });
    if (!thread) continue;

    const existingPosts = await prisma.forumPost.count({
      where: { thread_id: thread.id, deleted_at: null },
    });
    if (existingPosts > 0) {
      console.log(`SKIP replies thread #${thread.id}`);
      continue;
    }

    let content = draft.content;
    const extra = crossLinks[draft.baseSlug];
    if (extra) {
      content = `${content}\n\n---\n\n${linkify(extra, slugByBase)}`;
    }

    await prisma.thread.update({
      where: { id: thread.id },
      data: { content },
    });

    let lastPostId: number | null = null;
    let lastReplyUserId: number | null = null;
    let lastReplyAt: Date | null = null;
    const threadStart = thread.created_at;

    for (const reply of draft.replies) {
      const uid = userIds.get(reply.author);
      if (!uid) throw new Error(`Missing reply author ${reply.author}`);
      const at = new Date(threadStart.getTime() + reply.afterMin * 60 * 1000);
      const post = await prisma.forumPost.create({
        data: {
          content: linkify(reply.content, slugByBase),
          created_at: at,
          updated_at: at,
          thread: { connect: { id: thread.id } },
          user: { connect: { id: uid } },
        },
      });
      lastPostId = post.id;
      lastReplyUserId = uid;
      lastReplyAt = at;
    }

    await prisma.thread.update({
      where: { id: thread.id },
      data: {
        reply_count: draft.replies.length,
        last_reply_at: lastReplyAt,
        last_reply_user_id: lastReplyUserId,
      },
    });

    const forumPostCount = await prisma.forumPost.count({
      where: {
        deleted_at: null,
        thread: { forum_id: forumId, deleted_at: null },
      },
    });
    const forumThreadCount = await prisma.thread.count({
      where: { forum_id: forumId, deleted_at: null },
    });

    await prisma.forum.update({
      where: { id: forumId },
      data: {
        thread_count: forumThreadCount,
        post_count: forumPostCount,
        last_thread_id: thread.id,
        last_post_id: lastPostId,
      },
    });

    console.log(
      `REPLIES thread #${thread.id} +${draft.replies.length} (forum posts=${forumPostCount})`,
    );
  }

  // Refresh forum counters accurately once more
  for (const [, forumId] of forumIds) {
    const threadCount = await prisma.thread.count({
      where: { forum_id: forumId, deleted_at: null },
    });
    const postCount = await prisma.forumPost.count({
      where: {
        deleted_at: null,
        thread: { forum_id: forumId, deleted_at: null },
      },
    });
    const lastThread = await prisma.thread.findFirst({
      where: { forum_id: forumId, deleted_at: null },
      orderBy: [{ last_reply_at: 'desc' }, { created_at: 'desc' }],
    });
    const lastPost = lastThread
      ? await prisma.forumPost.findFirst({
          where: { thread_id: lastThread.id, deleted_at: null },
          orderBy: { created_at: 'desc' },
        })
      : null;
    await prisma.forum.update({
      where: { id: forumId },
      data: {
        thread_count: threadCount,
        post_count: postCount,
        last_thread_id: lastThread?.id ?? null,
        last_post_id: lastPost?.id ?? null,
      },
    });
  }

  console.log(`\nBatch ${BATCH} done. Threads:`);
  for (const u of createdUrls) console.log(u);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
