# Vesmart — Project Architecture

> Robot Vacuum **Review · Ecommerce · Blog · Forum** community platform.
>
> Document này là nguồn truth cho Cursor/AI khi triển khai. Schema DB chi tiết nằm ở [`DATABASE_ARCHITECTURE.prisma`](./DATABASE_ARCHITECTURE.prisma) — luôn đồng bộ với file đó, không tự ý đổi tên model/cột/enum.

---

## 1. Product Vision

Vesmart là website cộng đồng + thương mại điện tử về robot hút bụi:

| Domain | Mục đích |
|--------|----------|
| **Catalog** | Brand, Category, Product + Variant (giá/stock), Attribute, Tag |
| **Blog** | CMS bài viết review / tin tức |
| **Forum** | Diễn đàn kiểu XenForo: Category → Forum → Thread → ForumPost |
| **Community** | Comment, Favorite, Reaction (polymorphic) |
| **Auth / Admin** | User + JWT, Audit log thao tác admin |

Không xây Order/Cart/Payment ở phase hiện tại — schema catalog đã sẵn sàng mở rộng sau.

---

## 2. System Boundaries (bắt buộc)

```
Browser → Next.js (fe) → NestJS REST API (be) → Prisma → PostgreSQL
                              ↓
                        Cloudflare R2 (upload, chỉ lưu URL trong DB)
```

| Rule | Chi tiết |
|------|----------|
| FE không đụng DB | Next.js **không** dùng Prisma, không có `DATABASE_URL` |
| BE là sole owner của data | Mọi đọc/ghi qua NestJS REST |
| Business logic chỉ ở Service | Controller chỉ parse/validate/route; Repository chỉ query Prisma |
| Upload | Upload file lên R2; DB chỉ lưu URL string |
| Soft delete mặc định | Filter `deleted_at: null` trên mọi list/detail public |

---

## 3. Tech Stack

### Frontend (`web/fe`)

| Layer | Choice |
|-------|--------|
| Framework | Next.js App Router + TypeScript |
| UI | TailwindCSS + radix-ui |
| Form | React Hook Form + Zod |
| Data | Fetch NestJS API (server components / client fetch wrapper) |

### Backend (`web/be`)

| Layer | Choice |
|-------|--------|
| Framework | NestJS + TypeScript strict |
| ORM | Prisma |
| DB | PostgreSQL |
| Auth | JWT (access + refresh nếu cần) |
| Docs | Swagger (`@nestjs/swagger`) |
| Security | Helmet, CORS, Rate Limit |
| Validation | `class-validator` + `class-transformer` (DTO) |

Không thêm thư viện nếu TypeScript thuần giải quyết được.

---

## 4. Repository Layout

```
web/
├── DATABASE_ARCHITECTURE.prisma   # Schema design (source of truth)
├── PROJECT_ARCHITECTURE.md        # Document này
├── fe/                            # Next.js
│   └── src/
│       ├── app/                   # App Router routes (mỏng — chỉ compose Template)
│       ├── components/
│       │   ├── layouts/           # ProviderLayout, AdminLayout, ...
│       │   ├── partials/          # Header, Footer, Sidebar, ...
│       │   ├── ui/                # radix wrappers / atoms tái sử dụng
│       │   └── modules/           # Page templates theo domain (xem §9.2)
│       ├── lib/                   # api client, utils
│       ├── hooks/
│       └── types/                 # API response types (mirror BE DTO)
└── be/                            # NestJS
    ├── prisma/
    │   └── schema.prisma          # Copy/sync từ DATABASE_ARCHITECTURE.prisma
    └── src/
        ├── main.ts
        ├── app.module.ts
        ├── common/                # filters, interceptors, guards, pipes, dto base
        ├── prisma/                # PrismaModule + PrismaService
        └── modules/               # NestJS feature modules (xem §6)
```

---

## 5. Database Contract

**Nguồn truth:** `DATABASE_ARCHITECTURE.prisma`

Khi implement BE:

1. Đồng bộ nội dung vào `be/prisma/schema.prisma`
2. Bật `url = env("DATABASE_URL")` trong datasource
3. `npx prisma migrate` — không sửa migration thủ công trừ khi cần

### 5.1 Conventions (khớp schema)

| Item | Rule |
|------|------|
| ID | `cuid` string |
| Timestamps | `created_at`, `updated_at` mọi bảng |
| Soft delete | `deleted_at` nullable; query mặc định exclude đã xóa |
| Naming DB | `snake_case` qua `@map` / `@@map` |
| Prisma model | PascalCase (`ProductVariant`) |
| Money | `Decimal(14,2)` — không dùng `float` |
| Slug + SEO | Entity public có `slug`, `seo_title`, `seo_description` |

### 5.2 Domain map (model → module)

| Module | Prisma models |
|--------|----------------|
| `auth` / `users` | `User`, `OAuthAccount` |
| `brands` | `Brand` |
| `categories` | `Category` |
| `products` | `Product`, `ProductVariant`, `ProductImage`, `ProductAttribute`, `ProductAttributeValue`, `VariantAttribute`, `ProductTag` |
| `tags` | `Tag` (+ dùng chung junction) |
| `posts` | `PostCategory`, `Post`, `PostTag` |
| `comments` | `Comment` |
| `forums` | `ForumCategory`, `Forum`, `Thread`, `ForumPost`, `ThreadTag` |
| `favorites` | `Favorite` |
| `reactions` | `Reaction` |
| `audit` | `AuditLog` |
| `uploads` | (không có model — chỉ service R2) |

### 5.3 Khái niệm Forum (tránh nhầm)

```
ForumCategory     → nhóm hiển thị (vd: "Sản phẩm", "Hỗ trợ")
  └── Forum       → chuyên mục (vd: "Dreame", "Xiaomi")
        └── Thread      → chủ đề; `content` = bài mở đầu
              └── ForumPost → bài trả lời trong chủ đề
```

- `Post` (blog) ≠ `ForumPost` (diễn đàn) — tuyệt đối không gộp.
- Counter trên `Forum` / `Thread` (`thread_count`, `post_count`, `reply_count`, `last_*`) cập nhật trong **cùng transaction** khi tạo/xóa thread/post.

### 5.4 Polymorphic entities

Áp dụng cho `Comment`, `Favorite`, `Reaction`:

| Field | Rule |
|-------|------|
| `target_type` | Enum `TargetType` |
| `target_id` | cuid của entity đích |

**Allowed targets:**

| Entity | Allowed `target_type` |
|--------|------------------------|
| Comment | `PRODUCT`, `POST` |
| Favorite | `PRODUCT`, `POST`, `THREAD` |
| Reaction | `FORUM_POST`, `COMMENT` |

Prisma không có FK polymorphic → **Service phải**:

1. Validate `target_type` thuộc whitelist trên
2. Verify record đích tồn tại và `deleted_at IS NULL`
3. Unique constraint đã có trong schema — map Prisma `P2002` thành 409

### 5.5 Soft delete & cascade policy

| Hành động user-facing | Cách làm |
|-----------------------|----------|
| Xóa Product / Post / Thread / Comment | Set `deleted_at = now()` |
| Hard delete | Chỉ admin maintenance / cascade con phụ thuộc (image, junction) |
| List API | Luôn `where: { deleted_at: null }` trừ admin `?include_deleted=true` |

`onDelete` trong schema:

- **Restrict** — Brand/Category/Forum còn con → không cho xóa cứng
- **Cascade** — xóa Product → xóa Variant/Image/ProductTag
- **SetNull** — `Forum.last_thread_id`, `last_post_id`, `Thread.last_reply_user_id`

---

## 6. Backend Module Structure (`be/src/modules`)

NestJS **feature module** — mỗi domain một folder, đăng ký vào `AppModule`.

### 6.1 Cấu trúc chuẩn mỗi module

```
be/src/modules/products/
├── products.module.ts
├── products.controller.ts
├── products.service.ts
├── products.repository.ts
├── dto/
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   └── query-product.dto.ts
└── entities/                    # optional response typings / swagger models
    └── product.entity.ts
```

### 6.2 Catalog modules (mô tả trách nhiệm)

| Module | Prisma models | Trách nhiệm |
|--------|---------------|-------------|
| `auth` | — (dùng `User`) | Register, login, refresh JWT, logout; không CRUD profile đầy đủ |
| `users` | `User`, `OAuthAccount` | Profile (`/me`), admin quản lý user, ban/unban; stub OAuth sau |
| `uploads` | — | Upload Cloudflare R2, trả URL; không lưu binary trong DB |
| `brands` | `Brand` | CRUD thương hiệu; public list/detail theo slug |
| `categories` | `Category` | Danh mục sản phẩm nhiều cấp; endpoint tree |
| `tags` | `Tag` | Tag dùng chung Product / Post / Thread |
| `products` | `Product`, `ProductVariant`, `ProductImage`, `ProductAttribute`, `ProductAttributeValue`, `VariantAttribute`, `ProductTag` | Catalog SPU/SKU; giá & stock **chỉ** ở variant; gallery; attributes |
| `posts` | `PostCategory`, `Post`, `PostTag` | Blog/CMS; category tree; publish workflow |
| `forums` | `ForumCategory`, `Forum`, `Thread`, `ForumPost`, `ThreadTag` | Diễn đàn XenForo-style; cập nhật counter trong transaction |
| `comments` | `Comment` | Polymorphic comment (`PRODUCT`, `POST`); reply nhiều cấp; moderation status |
| `favorites` | `Favorite` | Bookmark polymorphic (`PRODUCT`, `POST`, `THREAD`) |
| `reactions` | `Reaction` | Reaction (`FORUM_POST`, `COMMENT`) — LIKE / LOVE / HAHA |
| `audit` | `AuditLog` | Ghi & xem log thao tác admin/mod |

Sub-resource có thể là controller riêng trong cùng module (vd. `variants` trong `products`, `forum-posts` trong `forums`) — **không** tách module NestJS mới trừ khi domain đủ lớn.

### 6.3 Layer responsibilities

| Layer | Được phép | Không được |
|-------|-----------|------------|
| Controller | HTTP, Guards, map DTO ↔ service input, Swagger | Prisma, business rules |
| Service | Business rules, transaction, audit, counters | `@Req()` / HTTP concerns |
| Repository | Prisma queries only | Business branching phức tạp |

### 6.4 Module build order (Cursor implement theo thứ tự)

1. `common` + `prisma`
2. `users` + `auth`
3. `uploads`
4. `brands` → `categories` → `tags`
5. `products` (variants, images, attributes)
6. `posts` (post-categories)
7. `forums` (forum-categories → forums → threads → forum-posts)
8. `comments` → `favorites` → `reactions`
9. `audit`

---

## 7. API Conventions

### 7.1 Base

- Prefix: `/api/v1`
- Swagger: `/api/docs`
- Auth header: `Authorization: Bearer <access_token>`

### 7.2 Response envelope (bắt buộc)

Success:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

List có phân trang:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "items": [],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

Error:

```json
{
  "success": false,
  "message": "Human readable error",
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "details": null
  }
}
```

Implement bằng global `TransformInterceptor` + `HttpExceptionFilter` trong `common/`.

### 7.3 REST shape (gợi ý)

| Area | Endpoints (ví dụ) |
|------|-------------------|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me` |
| Users | `GET/PATCH /users/me`, admin `GET/PATCH /users/:id` |
| Brands | CRUD `/brands`, public list/detail by slug |
| Categories | CRUD `/categories`, tree endpoint `GET /categories/tree` |
| Products | CRUD `/products`, `GET /products/:slug` |
| Variants | nested `/products/:productId/variants` |
| Posts | CRUD `/posts`, `GET /posts/:slug` |
| Forums | `GET /forum-categories`, `GET /forums/:slug`, `GET /forums/:id/threads` |
| Threads | `POST /threads`, `GET /threads/:slug`, lock/pin (mod) |
| Forum posts | `POST /threads/:threadId/posts` |
| Comments | `GET/POST /comments?target_type=&target_id=` |
| Favorites | `POST/DELETE /favorites` |
| Reactions | `POST/DELETE /reactions` |
| Uploads | `POST /uploads` → trả URL R2 |
| Audit | admin `GET /audit-logs` |

Public read dùng **slug**; admin/internal dùng **id**.

### 7.4 Query chuẩn

Mọi list hỗ trợ (khi hợp lý):

- `page`, `limit` (max 100)
- `search`
- `sort` (`created_at:desc`, `name:asc`, …)
- filter theo FK / status / published

---

## 8. Auth & Authorization

### Roles (`UserRole`)

| Role | Quyền chính |
|------|-------------|
| `USER` | CRUD content của mình (comment, thread, favorite…); đọc public |
| `MODERATOR` | Duyệt comment, ẩn/lock thread, soft-delete nội dung community |
| `ADMIN` | Full CRUD catalog/blog/forum config + users + audit |

### Rules

- Password hash bằng bcrypt hoặc argon2 — **không** lưu plain text
- `User.status = BANNED` → chặn login / mọi write
- JWT payload tối thiểu: `{ sub: userId, role }`
- Guard: `JwtAuthGuard`, `RolesGuard`
- Decorator: `@Roles(UserRole.ADMIN)`, `@CurrentUser()`
- OAuth (`OAuthAccount`) — stub/module sẵn, implement sau; đừng block phase 1

### Audit

Mọi action admin/mod quan trọng gọi `AuditService.log({ actorId, action, entityType, entityId, metadata, ip })`.

Ví dụ: `LOGIN`, `CREATE/UPDATE/DELETE` Product, `DELETE` Thread, `BAN_USER`.

---

## 9. Frontend Architecture

### 9.1 Route groups (gợi ý)

```
fe/src/app/
├── (root)/                 # public site
│   ├── page.tsx            # → HomeTemplate
│   ├── products/
│   ├── blog/
│   ├── forum/
│   └── auth/
├── (account)/              # user area (favorites, profile)
└── (admin)/                # admin panel — chỉ role ADMIN/MODERATOR
```

### 9.2 `components/modules` — Page templates

`fe/src/components/modules/` chứa **UI theo trang/domain** (Template).  
`app/` chỉ route + metadata + compose Template — **không** viết layout/business UI dài trong `page.tsx`.

#### Vai trò các tầng `components/`

| Thư mục | Vai trò | Ví dụ |
|---------|---------|--------|
| `layouts/` | Shell / provider bọc nhiều trang | `ProviderLayout` |
| `partials/` | Khối dùng lại xuyên site | `Header`, `Footer` |
| `ui/` | Atom/molecule thuần UI (radix) | `Button`, `Input`, `Dialog` |
| `modules/` | Template + section của **một** page/feature | `HomeTemplate`, `ProductDetailTemplate` |

#### Quy ước

```
fe/src/components/modules/
├── HomeTemplate/
│   ├── index.tsx              # export default Template (entry)
│   ├── sections/              # optional — Hero, FeaturedProducts, ...
│   └── components/            # optional — chỉ dùng trong module này
├── ProductListTemplate/
├── ProductDetailTemplate/
├── BlogListTemplate/
├── BlogDetailTemplate/
├── ForumHomeTemplate/
├── ThreadDetailTemplate/
├── AuthLoginTemplate/
└── ...
```

| Rule | Chi tiết |
|------|----------|
| Naming | `<Feature>Template` — PascalCase folder + `index.tsx` |
| `page.tsx` | Import Template, truyền params/searchParams nếu cần; giữ mỏng |
| Data | Template (hoặc section con) gọi `lib/api/*`; không fetch trong `partials` trừ case global (user menu) |
| Tái sử dụng | Section dùng lại ở ≥2 Template → cân nhắc đưa lên `partials/` hoặc `ui/` |
| Scope | Một Template = một page (hoặc một nhóm view rất sát nhau, vd. list + empty state) |
| Không | Nhét API client / JWT logic vào `ui/`; không để toàn bộ trang trong `app/**/page.tsx` |

#### Ví dụ pattern hiện tại

```tsx
// fe/src/app/(root)/page.tsx
import HomeTemplate from "@/components/modules/HomeTemplate";

const HomePage = () => {
  return <HomeTemplate />;
};

export default HomePage;
```

#### Catalog FE modules (map domain)

| Module folder | Route gợi ý | Ghi chú |
|---------------|-------------|---------|
| `HomeTemplate` | `/` | Hero, sản phẩm nổi bật, bài viết mới, forum hot |
| `ProductListTemplate` | `/products` | Filter brand/category/tag, pagination |
| `ProductDetailTemplate` | `/products/[slug]` | Gallery, variants (giá/stock), attributes, comments, favorite |
| `BlogListTemplate` | `/blog` | List + category |
| `BlogDetailTemplate` | `/blog/[slug]` | Content, tags, comments, favorite |
| `ForumHomeTemplate` | `/forum` | ForumCategory → Forum list (dùng counter) |
| `ForumThreadListTemplate` | `/forum/[slug]` | Threads trong một Forum |
| `ThreadDetailTemplate` | `/forum/threads/[slug]` | Thread content + ForumPost list, reaction |
| `AuthLoginTemplate` / `AuthRegisterTemplate` | `/auth/*` | Form RHF + Zod |
| `AccountFavoritesTemplate` | `/account/favorites` | Favorite polymorphic |
| `Admin*` (sau) | `/(admin)/*` | Catalog/moderation — tách template riêng, không mixed public |

### 9.3 Data access

```
fe/src/lib/api/
├── client.ts               # fetch wrapper + auth header + envelope unwrap
├── products.ts
├── posts.ts
├── forums.ts
└── ...
```

- Server Components gọi API khi cần SEO (product/blog detail)
- Client Components cho form, comment, reaction, favorite
- Types mirror response DTO — không import từ `be/`

### 9.4 UI rules

- Page UI nằm trong `components/modules/*Template`
- Tái sử dụng `components/partials` (Header/Footer) và `components/ui`
- Form: React Hook Form + Zod schema khớp validation BE
- Không hardcode danh sách brand/category/product — luôn lấy API

---

## 10. Cross-cutting Concerns

### Soft delete helper

Repository/base query luôn gắn:

```ts
deleted_at: null
```

Trừ khi admin explicitly yêu cầu.

### Slug

- Generate từ `name`/`title` (slugify)
- Unique theo rule schema (`products.slug` global unique; `threads` unique theo `(forum_id, slug)`)
- Đổi tên không bắt buộc đổi slug (tránh gãy URL) — trừ khi admin force

### Counters (Forum / Thread)

Trong **transaction** khi:

| Event | Updates |
|-------|---------|
| Create Thread | `Forum.thread_count++`, set `last_thread_id`, `last_post_id` nếu có |
| Create ForumPost | `Thread.reply_count++`, `last_reply_at`, `last_reply_user_id`; `Forum.post_count++`, `last_post_id` |
| Soft-delete | Giảm counter tương ứng; recalc `last_*` nếu cần |

Không tin counter từ client.

### Uploads

1. FE gửi multipart tới `POST /uploads`
2. BE validate mime/size → upload R2
3. Trả `{ url }`
4. FE/BE lưu URL vào field `thumbnail` / `image_url` / `avatar` / `logo`

---

## 11. Coding Rules (Cursor phải tuân thủ)

### Always

- TypeScript strict, **không** `any`
- Clean Architecture lite: Controller → Service → Repository → Prisma
- SOLID, DRY, KISS — không over-engineer
- Mỗi feature: Module + Controller + Service + Repository + DTO + Swagger
- Validation đầy đủ trên mọi input
- Envelope response thống nhất
- Map error Prisma (`P2002`, `P2025`) sang HTTP rõ ràng
- Đồng bộ enum/DTO với `DATABASE_ARCHITECTURE.prisma`

### Never

- FE gọi database / chứa secret DB
- Business logic trong Controller
- Hardcode danh mục, sản phẩm, tag
- Lưu giá/stock trên `Product` (chỉ trên `ProductVariant`)
- Gộp `Post` và `ForumPost`
- Thêm thư viện “cho tiện” khi TS thuần đủ
- Sinh file/docs thừa không được yêu cầu
- Đổi tên bảng/cột trong schema mà không cập nhật document này + prisma file

### Naming

| Context | Style |
|---------|-------|
| TS files / classes | Nest mặc định: `products.service.ts`, `ProductsService` |
| DTO fields (JSON API) | `camelCase` |
| Prisma / DB | theo schema (`snake_case` mapped) |
| Service map DTO → Prisma | convert camelCase ↔ snake_case tại repository/service boundary |

---

## 12. Environment

### `be/.env` (ví dụ)

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/vesmart
JWT_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=
CORS_ORIGIN=http://localhost:3000
PORT=3001
```

### `fe/.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Không commit secret thật.

---

## 13. Implementation Phases

Làm tuần tự — không nhảy cóc domain chưa có dependency.

### Phase 0 — Foundation

- [x] Sync `DATABASE_ARCHITECTURE.prisma` → `be/prisma/schema.prisma`
- [x] PrismaModule, common envelope/filter/guards
- [x] Health check

### Phase 1 — Auth

- [x] Register / Login / JWT / me
- [x] RolesGuard
- [x] Audit login

### Phase 2 — Catalog read/write

- [x] Brands, Categories (tree), Tags
- [x] Products + Images + Variants + Attributes
- [x] Public product by slug

### Phase 3 — Blog

- [x] PostCategory tree, Post CRUD, PostTag
- [x] Public post by slug

### Phase 4 — Forum

- [x] ForumCategory → Forum → Thread → ForumPost
- [x] Counter updates in transaction
- [x] ThreadTag, pin/lock (mod)

### Phase 5 — Community

- [x] Comment (PRODUCT, POST)
- [x] Favorite (PRODUCT, POST, THREAD)
- [x] Reaction (FORUM_POST, COMMENT)

### Phase 6 — FE surfaces

- [x] Home, product list/detail, blog, forum
- [x] Auth UI, favorite/reaction/comment UX
- [x] Admin tối thiểu cho catalog + moderation

### Phase 7 — Hardening

- [x] Rate limit, Helmet, CORS production
- [x] Swagger hoàn chỉnh
- [x] Seed data demo (brands Dreame/Xiaomi/Roborock)

---

## 14. Definition of Done (mỗi feature)

Một feature được coi là xong khi:

1. Schema liên quan đã có trong Prisma (không tự invent cột)
2. DTO + validation + Swagger
3. Service cover soft delete / authz / unique conflict
4. Repository không leak sang HTTP
5. API trả envelope chuẩn
6. (Nếu FE trong scope) UI gọi đúng endpoint, không mock cứng data production
7. Không phá convention §11

---

## 15. AI / Cursor Agent Instructions

Khi nhận task implement:

1. **Đọc** `PROJECT_ARCHITECTURE.md` + phần model liên quan trong `DATABASE_ARCHITECTURE.prisma` trước khi viết code.
2. **Chỉ sửa** module/domain được yêu cầu; không refactor lan sang domain khác.
3. **Giữ** tên model/enum/field khớp schema.
4. **Ưu tiên** Phase order (§13) nếu task là “scaffold project”.
5. **Không** tạo Order/Cart/Payment trừ khi user yêu cầu rõ.
6. **Polymorphic** — luôn validate whitelist `target_type` trong Service.
7. **Forum counters** — luôn cập nhật trong transaction.
8. Nếu mâu thuẫn giữa code hiện tại và 2 file architecture → **ưu tiên architecture files**, hỏi user trước khi đổi schema.

---

## 16. Quick Reference — Enums

Copy từ schema; dùng đúng literal, không tự thêm value trừ khi cập nhật cả Prisma + doc:

- `UserRole`: `ADMIN` | `MODERATOR` | `USER`
- `UserStatus`: `ACTIVE` | `INACTIVE` | `BANNED`
- `ProductStatus`: `DRAFT` | `PUBLISHED` | `ARCHIVED`
- `VariantStatus`: `ACTIVE` | `INACTIVE` | `OUT_OF_STOCK`
- `PostStatus`: `DRAFT` | `PUBLISHED` | `ARCHIVED`
- `ThreadStatus`: `OPEN` | `CLOSED` | `HIDDEN` | `DELETED`
- `CommentStatus`: `PENDING` | `APPROVED` | `REJECTED` | `SPAM`
- `TargetType`: `PRODUCT` | `POST` | `THREAD` | `FORUM_POST` | `COMMENT`
- `ReactionType`: `LIKE` | `LOVE` | `HAHA`
- `AuditAction`: `LOGIN` | `LOGOUT` | `CREATE` | `UPDATE` | `DELETE` | `RESTORE` | `PUBLISH` | `UNPUBLISH` | `BAN_USER` | `UNBAN_USER` | `OTHER`
