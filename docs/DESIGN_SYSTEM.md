Đọc toàn bộ DESIGN_SYSTEM.md trước khi thực hiện.

Thiết kế giao diện theo triết lý của XenForo, KHÔNG clone HTML/CSS hay copy giao diện.

Mục tiêu là học UX, Information Architecture và Layout của XenForo, sau đó hiện đại hóa bằng Next.js + TailwindCSS + radix-ui.

## Design Style

Phong cách:

- XenForo
- Vercel
- Linear
- Apple

Ưu tiên:

- Clean
- Premium
- Minimal
- Dễ đọc
- SEO Friendly

Không sử dụng:

- Glassmorphism
- Neumorphism
- Gradient lòe loẹt
- Animation quá nhiều
- Màu sắc sặc sỡ

---

## UX học từ XenForo

Học cách tổ chức thông tin của XenForo:

- Forum List
- Thread List
- Thread Detail
- User Card
- Breadcrumb
- Pagination
- Search
- Sidebar
- Statistics
- Latest Posts

Không copy UI.

Chỉ học:

- Layout
- Khoảng cách
- Thứ bậc thông tin
- Cách điều hướng
- Mật độ hiển thị
- Trải nghiệm người dùng

---

## Visual Style

Sử dụng:

- TailwindCSS
- radix-ui

Border Radius

12px

Shadow

Rất nhẹ.

Spacing

8px Grid System.

Typography

Font

Inter

Heading

font-semibold

Body

font-normal

Icons

lucide-react

Card

Border nhẹ.

Hover

Transition 150ms.

Button

Theo chuẩn radix-ui.

---

## Responsive

Thiết kế Mobile First.

Desktop

1440px

Tablet

768px

Mobile

390px

Không được vỡ layout.

---

## Component Rules

Tất cả component phải reusable.

Ưu tiên chia nhỏ component.

Ví dụ:

ForumCard

ThreadRow

ThreadHeader

ThreadMeta

PostCard

CommentCard

ProductCard

BlogCard

UserAvatar

UserBadge

Breadcrumb

Pagination

SearchBar

SidebarSection

StatsCard

---

## Forum Layout

Trang chủ Forum:

- Breadcrumb
- Danh sách Category
- Trong mỗi Category hiển thị nhiều Forum
- Hiển thị:
  - icon
  - tên
  - mô tả
  - số Thread
  - số Post
  - bài viết mới nhất

Thread List:

- Avatar
- Tiêu đề
- Prefix
- Tác giả
- Thời gian
- Views
- Replies
- Last Reply

Thread Detail:

- Bài đầu
- Danh sách Post
- Reply Box
- Sidebar (nếu cần)

---

## Ecommerce

Không thiết kế như Shopee.

Ưu tiên giống:

Apple

Amazon

Vercel

Product Detail:

- Gallery bên trái
- Thông tin bên phải
- Sticky purchase card
- Specification
- Review
- Discussion

---

## Blog

Trang Blog:

- Hero
- Featured
- Grid bài viết
- Sidebar
- Related Posts

---

## Animation

Framer Motion.

Animation nhẹ.

< 200ms.

Không animation khi không cần.

---

## Accessibility

Đảm bảo:

- Keyboard navigation
- Focus state
- aria-label
- Contrast đạt WCAG AA

---

## Coding Rules

- Không inline style.
- Không CSS thuần nếu Tailwind làm được.
- Không hardcode màu.
- Dùng Design Token.
- Dùng class-variance-authority nếu phù hợp.
- Component phải tái sử dụng.
- Luôn hỗ trợ Dark Mode.

---

Trước khi tạo giao diện, hãy phân tích:

1. Bố cục tổng thể.
2. UX.
3. Information Architecture.
4. Component cần tạo.
5. Responsive strategy.

Sau đó mới bắt đầu code.