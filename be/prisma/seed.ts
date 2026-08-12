import {
  PostStatus,
  PrismaClient,
  ProductStatus,
  UserRole,
  VariantStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type SeedPost = {
  title: string;
  baseSlug: string;
  summary: string;
  seoTitle: string;
  seoDescription: string;
  content: string;
  thumbLabel: string;
};

const MARKDOWN_POSTS: SeedPost[] = [
  {
    title: 'Hướng dẫn chọn robot hút bụi 2026: lực hút, pin và lau nhà',
    baseSlug: 'huong-dan-chon-robot-hut-bui-2026',
    summary:
      'Checklist thực tế khi mua robot hút bụi: lực hút, thời lượng pin, dock tự giặt giẻ và ngân sách phù hợp căn hộ Việt Nam.',
    seoTitle: 'Cách chọn robot hút bụi 2026 | Vesmart',
    seoDescription:
      'Bí quyết chọn robot hút bụi: Pa lực hút, pin, cảm biến, dock sấy giẻ và các lỗi thường gặp khi mua lần đầu.',
    thumbLabel: 'Chọn robot 2026',
    content: `## Vì sao nên mua robot hút bụi?

Robot hút bụi không thay thế hoàn toàn máy hút cầm tay, nhưng giúp **duy trì sàn sạch mỗi ngày** với ít công sức. Với căn hộ 50–100m², một máy tầm trung đã đủ nếu bạn chọn đúng cấu hình.

## 5 tiêu chí chọn máy

1. **Lực hút (Pa)** — Căn hộ có thảm mỏng nên ưu tiên ≥ 5.000 Pa; nhà có lông thú cưng nên ≥ 8.000 Pa.
2. **Thời lượng pin** — Ít nhất 120 phút thực tế cho diện tích > 70m².
3. **Độ cao vượt ngưỡng** — Ngưỡng cửa 2 cm là mức tối thiểu dễ sống.
4. **Dock tự động** — Tự đổ rác, tự giặt/sấy giẻ giúp giảm bảo trì hàng tuần.
5. **Bản đồ & ngăn phòng** — Lidar + app chia vùng giúp tránh khu vực nhạy cảm.

## So sánh nhanh phân khúc

| Phân khúc | Ngân sách | Phù hợp |
| --- | --- | --- |
| Phổ thông | 6–10 triệu | Studio, ít thảm |
| Tầm trung | 12–18 triệu | Căn hộ 2–3 phòng |
| Cao cấp | 20 triệu+ | Nhà rộng, pet, lau hút mạnh |

## Checklist trước khi đặt mua

- [ ] Đo diện tích và loại sàn (gạch / gỗ / thảm)
- [ ] Kiểm tra chỗ đặt dock (ổ điện + khoảng trống)
- [ ] Xem chi phí túi rác / giẻ lau thay thế
- [ ] Đọc review về độ ồn và app tiếng Việt

> Mẹo: ưu tiên máy có **cập nhật firmware** đều đặn và linh kiện thay thế dễ mua tại Việt Nam.

## Kết luận

Chọn robot theo **nhu cầu vệ sinh thực tế**, không chỉ theo thông số marketing. Nếu bạn nuôi thú cưng hoặc nhà nhiều góc chết, hãy ưu tiên lực hút cao và chổi cạnh linh hoạt.`,
  },
  {
    title: 'Review Dreame L10s Ultra: hút lau tự động sau 30 ngày dùng',
    baseSlug: 'review-dreame-l10s-ultra-30-ngay',
    summary:
      'Trải nghiệm Dreame L10s Ultra trên căn hộ 75m²: khả năng hút lông chó, dock tự giặt giẻ và những điểm còn hạn chế.',
    seoTitle: 'Review Dreame L10s Ultra sau 30 ngày | Vesmart',
    seoDescription:
      'Đánh giá chi tiết Dreame L10s Ultra: lực hút, lau nhà, dock tự động, độ ồn và có nên mua năm 2026.',
    thumbLabel: 'Dreame L10s Ultra',
    content: `## Tổng quan nhanh

**Dreame L10s Ultra** hướng tới người dùng muốn *set & forget*: dock tự đổ rác, tự giặt và sấy giẻ. Sau 30 ngày trên căn hộ 75m² (gạch + thảm ngắn), máy duy trì sàn sạch ổn định nếu chạy lịch 1 lần/ngày.

### Điểm nổi bật

- Lực hút mạnh, xử lý tốt lông thú cưng trên gạch
- Dock tự động giảm việc bảo trì hàng ngày
- App chia phòng rõ, lập lịch linh hoạt

### Điểm cần cải thiện

- Độ ồn dock khi sấy giẻ khá rõ vào ban đêm
- Giẻ lau cần thay đúng chu kỳ để tránh mùi

## Trải nghiệm thực tế

### Hút bụi

Trên sàn gạch, máy gom bụi mịn và lông chó khá tốt. Góc cạnh sofa vẫn cần chổi cạnh hoạt động ổn — L10s Ultra làm được mức **khá đến tốt**.

### Lau nhà

Chế độ xoay giẻ giúp lau vết nước trà nhạt. Với vết dầu ăn, vẫn nên lau tay bổ sung.

\`\`\`text
Lịch đề xuất (căn 75m²)
07:30  Hút + lau phòng khách / bếp
20:30  Chỉ hút phòng ngủ (tránh ồn)
Chủ nhật  Vệ sinh filter + kiểm tra giẻ
\`\`\`

## Ai nên mua?

- Bạn bận, muốn dock tự xử lý rác/giẻ
- Nhà có pet, sàn chủ yếu cứng
- Ngân sách tầm trung-cao

**Không hợp** nếu bạn chỉ cần hút khô giá rẻ hoặc nhà toàn thảm dày.`,
  },
  {
    title: 'Roborock vs Dreame vs Xiaomi: nên chọn hãng nào?',
    baseSlug: 'so-sanh-roborock-dreame-xiaomi',
    summary:
      'So sánh nhanh hệ sinh thái Roborock, Dreame và Xiaomi: phần mềm, linh kiện, độ bền và phân khúc giá tại Việt Nam.',
    seoTitle: 'So sánh Roborock, Dreame, Xiaomi | Vesmart',
    seoDescription:
      'Chọn robot hút bụi theo thương hiệu: ưu nhược điểm Roborock, Dreame, Xiaomi và gợi ý model theo ngân sách.',
    thumbLabel: 'So sánh 3 hãng',
    content: `## Tiêu chí so sánh

Chúng tôi chấm theo **app**, **độ hoàn thiện dock**, **dễ mua linh kiện** và **giá trị/đồng tiền**.

## Bảng so sánh

| Tiêu chí | Roborock | Dreame | Xiaomi |
| --- | --- | --- | --- |
| App & bản đồ | Rất tốt | Tốt | Tốt (đôi khi đơn giản hơn) |
| Dock cao cấp | Mạnh ở phân khúc trên | Mạnh tầm trung-cao | Đa dạng, nhiều mức giá |
| Linh kiện VN | Khá dễ | Ngày càng phổ biến | Rất dễ |
| Phân khúc nổi bật | Cao cấp ổn định | Cân bằng tính năng/giá | Entry → mid |

## Gợi ý theo nhu cầu

### Nhà mới dùng robot lần đầu
Ưu tiên **Xiaomi / Mijia** hoặc Dreame entry: dễ setup, giá mềm, đủ Lidar.

### Muốn ít bảo trì
Chọn model có dock **tự đổ + tự giặt/sấy** (Dreame L10s Ultra class hoặc Roborock tương đương).

### Nhà rộng, yêu cầu bản đồ chính xác
**Roborock** thường được đánh giá cao về điều hướng và độ ổn định dài hạn.

## Kết luận

Không có “hãng tốt nhất tuyệt đối”. Hãy chọn theo:

1. Ngân sách linh kiện thay thế
2. Nhu cầu lau nhà có dock hay không
3. Mức độ bạn chịu chỉnh app

Nếu phân vân giữa hai máy cùng giá, ưu tiên máy có **review dài hạn** và chính sách bảo hành rõ tại Việt Nam.`,
  },
  {
    title: 'Cách bảo dưỡng robot hút bụi để tăng tuổi thọ',
    baseSlug: 'bao-duong-robot-hut-bui',
    summary:
      'Lịch vệ sinh filter, chổi lăn, cảm biến và dock — giúp robot hút khỏe hơn và giảm mùi hôi giẻ lau.',
    seoTitle: 'Bảo dưỡng robot hút bụi đúng cách | Vesmart',
    seoDescription:
      'Hướng dẫn bảo dưỡng robot hút bụi: filter, chổi, cảm biến LiDAR, giẻ lau và dock tự động.',
    thumbLabel: 'Bảo dưỡng robot',
    content: `## Vì sao phải bảo dưỡng?

Robot yếu dần thường không phải do motor hỏng sớm, mà vì **filter bít**, chổi quấn tóc và cảm biến bẩn.

## Lịch bảo dưỡng đề xuất

### Sau mỗi 2–3 lần chạy
- Đổ khay bụi (nếu không dùng túi dock)
- Kiểm tra tóc quấn trục giữa

### Hàng tuần
- Rửa/giặt filter (để khô hoàn toàn trước khi lắp)
- Lau cảm biến tường / LiDAR cover bằng khăn mềm
- Thay hoặc giặt giẻ lau, vệ sinh khay nước

### Hàng tháng
- Kiểm tra bánh xe và chổi cạnh
- Vệ sinh ống dẫn dock (nếu máy tự đổ rác)

## Mẹo chống mùi

1. Không để giẻ ướt trong dock quá lâu khi tắt sấy
2. Dùng dung dịch lau đúng khuyến nghị hãng
3. Phơi khô filter — lắp filter ẩm rất dễ sinh mùi và giảm hút

## Dấu hiệu cần thay linh kiện

- Lực hút giảm rõ dù đã vệ sinh
- Máy báo lỗi chổi liên tục
- Vệt lau bị bẩn đều một phía (giẻ mòn / mô-tơ giẻ yếu)

Chăm sóc đúng cách giúp máy giữ hiệu suất tốt hơn sau 12–18 tháng sử dụng hàng ngày.`,
  },
];

async function upsertProductWithIdSlug(input: {
  brandId: number;
  categoryId: number;
  tagId: number;
  brandSlug: string;
  brandName: string;
  featured: boolean;
}) {
  const baseSlug = `${input.brandSlug}-l10s-ultra`;
  const productThumb = `https://placehold.co/800x600/png?text=${encodeURIComponent(input.brandName)}`;

  let product = await prisma.product.findFirst({
    where: {
      brand_id: input.brandId,
      sku: `${input.brandSlug.toUpperCase()}-L10S`,
      deleted_at: null,
    },
  });

  if (!product) {
    product = await prisma.product.create({
      data: {
        name: `${input.brandName} L10s Ultra`,
        slug: `${baseSlug}-tmp`,
        sku: `${input.brandSlug.toUpperCase()}-L10S`,
        short_description: `Robot hút bụi ${input.brandName} mẫu demo`,
        description: `## ${input.brandName} L10s Ultra\n\nMẫu demo phục vụ showcase catalog Vesmart.\n\n- Hút + lau\n- Dock tự động\n- Phù hợp căn hộ`,
        thumbnail: productThumb,
        published: true,
        featured: input.featured,
        status: ProductStatus.PUBLISHED,
        brand: { connect: { id: input.brandId } },
        category: { connect: { id: input.categoryId } },
        product_tags: { create: [{ tag: { connect: { id: input.tagId } } }] },
        variants: {
          create: [
            {
              sku: `${input.brandSlug.toUpperCase()}-L10S-STD`,
              name: 'Standard',
              price: 15990000,
              sale_price: 14990000,
              stock: 10,
              status: VariantStatus.ACTIVE,
            },
          ],
        },
        images: {
          create: [
            {
              image_url: productThumb,
              alt_text: input.brandName,
              sort_order: 0,
            },
          ],
        },
      },
    });
  }

  return prisma.product.update({
    where: { id: product.id },
    data: {
      slug: `${baseSlug}-${product.id}`,
      thumbnail: productThumb,
      published: true,
      featured: input.featured,
      status: ProductStatus.PUBLISHED,
      description: `## ${input.brandName} L10s Ultra\n\nMẫu demo phục vụ showcase catalog Vesmart.\n\n- Hút + lau\n- Dock tự động\n- Phù hợp căn hộ`,
    },
  });
}

async function main() {
  const passwordAdmin = await bcrypt.hash('Admin123!', 10);
  const passwordHoang = await bcrypt.hash('baodeptrai199', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vesmart.local' },
    update: { role: UserRole.ADMIN, password: passwordAdmin },
    create: {
      email: 'admin@vesmart.local',
      username: 'admin',
      password: passwordAdmin,
      full_name: 'Vesmart Admin',
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'hoangbao020103@gmail.com' },
    update: {
      role: UserRole.ADMIN,
      password: passwordHoang,
      full_name: 'Hoang Bao',
    },
    create: {
      email: 'hoangbao020103@gmail.com',
      username: 'hoangbao',
      password: passwordHoang,
      full_name: 'Hoang Bao',
      role: UserRole.ADMIN,
    },
  });

  const brands = await Promise.all(
    [
      {
        name: 'Dreame',
        slug: 'dreame',
        description: 'Dreame robot vacuums',
        sort_order: 1,
      },
      {
        name: 'Xiaomi',
        slug: 'xiaomi',
        description: 'Xiaomi & Mijia robot vacuums',
        sort_order: 2,
      },
      {
        name: 'Roborock',
        slug: 'roborock',
        description: 'Roborock robot vacuums',
        sort_order: 3,
      },
    ].map((b) =>
      prisma.brand.upsert({
        where: { slug: b.slug },
        update: { name: b.name, description: b.description },
        create: b,
      }),
    ),
  );

  const category = await prisma.category.upsert({
    where: { slug: 'robot-hut-bui' },
    update: {},
    create: {
      name: 'Robot hút bụi',
      slug: 'robot-hut-bui',
      description: 'Danh mục robot hút bụi',
      sort_order: 1,
    },
  });

  const postCategoryReviews = await prisma.postCategory.upsert({
    where: { slug: 'reviews' },
    update: {},
    create: {
      name: 'Reviews',
      slug: 'reviews',
      description: 'Bài review & trải nghiệm sản phẩm',
      sort_order: 1,
    },
  });

  const postCategoryGuides = await prisma.postCategory.upsert({
    where: { slug: 'huong-dan' },
    update: {},
    create: {
      name: 'Hướng dẫn',
      slug: 'huong-dan',
      description: 'Tips chọn mua và bảo dưỡng',
      sort_order: 2,
    },
  });

  const tagRobot = await prisma.tag.upsert({
    where: { slug: 'robot' },
    update: {},
    create: { name: 'Robot', slug: 'robot' },
  });

  const tagReview = await prisma.tag.upsert({
    where: { slug: 'review' },
    update: {},
    create: { name: 'Review', slug: 'review' },
  });

  for (const brand of brands) {
    await upsertProductWithIdSlug({
      brandId: brand.id,
      categoryId: category.id,
      tagId: tagRobot.id,
      brandSlug: brand.slug,
      brandName: brand.name,
      featured: brand.slug === 'dreame',
    });
  }

  for (const [index, item] of MARKDOWN_POSTS.entries()) {
    const categoryId =
      item.baseSlug.includes('huong-dan') || item.baseSlug.includes('bao-duong')
        ? postCategoryGuides.id
        : item.baseSlug.includes('so-sanh')
          ? postCategoryGuides.id
          : postCategoryReviews.id;

    let post = await prisma.post.findFirst({
      where: { title: item.title, deleted_at: null },
    });

    if (!post) {
      post = await prisma.post.create({
        data: {
          title: item.title,
          slug: `${item.baseSlug}-tmp`,
          summary: item.summary,
          content: item.content,
          seo_title: item.seoTitle,
          seo_description: item.seoDescription,
          status: PostStatus.PUBLISHED,
          published_at: new Date(Date.now() - index * 86_400_000),
          thumbnail: `https://placehold.co/1200x630/png?text=${encodeURIComponent(item.thumbLabel)}`,
          author: { connect: { id: admin.id } },
          category: { connect: { id: categoryId } },
          post_tags: {
            create: [
              { tag: { connect: { id: tagRobot.id } } },
              { tag: { connect: { id: tagReview.id } } },
            ],
          },
        },
      });
    }

    await prisma.post.update({
      where: { id: post.id },
      data: {
        slug: `${item.baseSlug}-${post.id}`,
        summary: item.summary,
        content: item.content,
        seo_title: item.seoTitle,
        seo_description: item.seoDescription,
        status: PostStatus.PUBLISHED,
        published_at: post.published_at ?? new Date(),
        thumbnail: `https://placehold.co/1200x630/png?text=${encodeURIComponent(item.thumbLabel)}`,
      },
    });
  }

  const forumCategory = await prisma.forumCategory.upsert({
    where: { slug: 'san-pham' },
    update: {},
    create: {
      name: 'Sản phẩm',
      slug: 'san-pham',
      description: 'Thảo luận theo thương hiệu',
      sort_order: 1,
    },
  });

  for (const brand of brands) {
    await prisma.forum.upsert({
      where: { slug: brand.slug },
      update: {},
      create: {
        name: brand.name,
        slug: brand.slug,
        description: `Diễn đàn ${brand.name}`,
        sort_order: brand.sort_order,
        category: { connect: { id: forumCategory.id } },
      },
    });
  }

  const dreameForum = await prisma.forum.findUnique({
    where: { slug: 'dreame' },
  });
  if (dreameForum) {
    const baseSlug = 'chao-mung-dreame';
    let thread = await prisma.thread.findFirst({
      where: {
        forum_id: dreameForum.id,
        title: 'Chào mừng cộng đồng Dreame',
        deleted_at: null,
      },
    });
    if (!thread) {
      thread = await prisma.thread.create({
        data: {
          title: 'Chào mừng cộng đồng Dreame',
          slug: `${baseSlug}-tmp`,
          content:
            '## Xin chào\n\nThread mở đầu chuyên mục Dreame.\n\nChia sẻ kinh nghiệm dùng robot, tip bảo dưỡng và review phụ kiện tại đây.',
          forum: { connect: { id: dreameForum.id } },
          user: { connect: { id: admin.id } },
        },
      });
    }
    thread = await prisma.thread.update({
      where: { id: thread.id },
      data: { slug: `${baseSlug}-${thread.id}` },
    });
    await prisma.forum.update({
      where: { id: dreameForum.id },
      data: {
        thread_count: 1,
        last_thread_id: thread.id,
      },
    });
  }

  // Kho ảnh 2 cấp mặc định
  const sanPham = await prisma.imageCategory.upsert({
    where: { slug: 'san-pham' },
    update: { name: 'Sản phẩm', deleted_at: null },
    create: { name: 'Sản phẩm', slug: 'san-pham', sort_order: 0 },
  });
  await prisma.imageCategory.upsert({
    where: { slug: 'san-pham-chia-se' },
    update: {
      name: 'Chia sẻ',
      parent_id: sanPham.id,
      deleted_at: null,
    },
    create: {
      name: 'Chia sẻ',
      slug: 'san-pham-chia-se',
      parent_id: sanPham.id,
      sort_order: 0,
    },
  });

  const robot = await prisma.imageCategory.upsert({
    where: { slug: 'robot-hut-bui' },
    update: { name: 'Robot hút bụi', deleted_at: null },
    create: { name: 'Robot hút bụi', slug: 'robot-hut-bui', sort_order: 1 },
  });
  await prisma.imageCategory.upsert({
    where: { slug: 'robot-hut-bui-chia-se' },
    update: {
      name: 'Chia sẻ',
      parent_id: robot.id,
      deleted_at: null,
    },
    create: {
      name: 'Chia sẻ',
      slug: 'robot-hut-bui-chia-se',
      parent_id: robot.id,
      sort_order: 0,
    },
  });

  console.log('Seed completed.');
  console.log('Admin: admin@vesmart.local / Admin123!');
  console.log('Admin: hoangbao020103@gmail.com / baodeptrai199');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
