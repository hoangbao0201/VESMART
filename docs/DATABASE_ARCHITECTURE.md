// =============================================================================
// Vesmart — Prisma Schema (NestJS + PostgreSQL)
// Ecommerce + Blog + Forum + Community
// Naming: snake_case via @map / @@map | IDs: cuid | Soft delete: deleted_at
// =============================================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =============================================================================
// ENUMS
// =============================================================================

/// Vai trò người dùng trong hệ thống.
enum UserRole {
  ADMIN
  MODERATOR
  USER

  @@map("user_role")
}

/// Trạng thái tài khoản người dùng.
enum UserStatus {
  ACTIVE
  INACTIVE
  BANNED

  @@map("user_status")
}

/// Nhà cung cấp OAuth (mở rộng sau này).
enum OAuthProvider {
  GOOGLE
  FACEBOOK
  GITHUB
  APPLE

  @@map("oauth_provider")
}

/// Trạng thái sản phẩm (workflow biên tập).
enum ProductStatus {
  DRAFT
  PUBLISHED
  ARCHIVED

  @@map("product_status")
}

/// Trạng thái biến thể sản phẩm (bán / ngừng bán).
enum VariantStatus {
  ACTIVE
  INACTIVE
  OUT_OF_STOCK

  @@map("variant_status")
}

/// Trạng thái bài viết blog.
enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED

  @@map("post_status")
}

/// Trạng thái chủ đề forum.
enum ThreadStatus {
  OPEN
  CLOSED
  HIDDEN
  DELETED

  @@map("thread_status")
}

/// Trạng thái bình luận (moderation).
enum CommentStatus {
  PENDING
  APPROVED
  REJECTED
  SPAM

  @@map("comment_status")
}

/// Đối tượng polymorphic cho Comment / Favorite.
enum TargetType {
  PRODUCT
  POST
  THREAD
  FORUM_POST
  COMMENT

  @@map("target_type")
}

/// Loại reaction.
enum ReactionType {
  LIKE
  LOVE
  HAHA

  @@map("reaction_type")
}

/// Hành động ghi nhận trong audit log.
enum AuditAction {
  LOGIN
  LOGOUT
  CREATE
  UPDATE
  DELETE
  RESTORE
  PUBLISH
  UNPUBLISH
  BAN_USER
  UNBAN_USER
  OTHER

  @@map("audit_action")
}

// =============================================================================
// AUTHENTICATION
// =============================================================================

/// Tài khoản người dùng — nguồn identity chính của hệ thống.
/// Password lưu dạng hash (bcrypt/argon2). Soft delete để giữ lịch sử đơn/comment.
model User {
  id            String     @id @default(cuid())
  email         String     @unique @map("email") @db.VarChar(255)
  username      String     @unique @map("username") @db.VarChar(50)
  password      String     @map("password") @db.VarChar(255)
  full_name     String?    @map("full_name") @db.VarChar(150)
  avatar        String?    @map("avatar") @db.VarChar(500)
  status        UserStatus @default(ACTIVE) @map("status")
  role          UserRole   @default(USER) @map("role")
  last_login_at DateTime?  @map("last_login_at")
  created_at    DateTime   @default(now()) @map("created_at")
  updated_at    DateTime   @updatedAt @map("updated_at")
  deleted_at    DateTime?  @map("deleted_at")

  oauth_accounts      OAuthAccount[]
  posts               Post[]               @relation("PostAuthor")
  comments            Comment[]
  favorites           Favorite[]
  reactions           Reaction[]
  threads             Thread[]             @relation("ThreadAuthor")
  forum_posts         ForumPost[]          @relation("ForumPostAuthor")
  last_reply_threads  Thread[]             @relation("ThreadLastReplyUser")
  audit_logs          AuditLog[]           @relation("AuditActor")

  @@index([status])
  @@index([role])
  @@index([created_at])
  @@index([deleted_at])
  @@map("users")
}

/// Liên kết OAuth (Google, Facebook, ...) — mở rộng đăng nhập xã hội sau này.
/// Một user có thể gắn nhiều provider; mỗi (provider, provider_user_id) là duy nhất.
model OAuthAccount {
  id                String        @id @default(cuid())
  user_id           String        @map("user_id")
  provider          OAuthProvider @map("provider")
  provider_user_id  String        @map("provider_user_id") @db.VarChar(255)
  access_token      String?       @map("access_token") @db.Text
  refresh_token     String?       @map("refresh_token") @db.Text
  expires_at        DateTime?     @map("expires_at")
  created_at        DateTime      @default(now()) @map("created_at")
  updated_at        DateTime      @updatedAt @map("updated_at")
  deleted_at        DateTime?     @map("deleted_at")

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([provider, provider_user_id])
  @@unique([user_id, provider])
  @@index([user_id])
  @@map("oauth_accounts")
}

// =============================================================================
// ECOMMERCE — CATALOG
// =============================================================================

/// Thương hiệu sản phẩm (Dreame, Xiaomi, Roborock, ...).
model Brand {
  id              String    @id @default(cuid())
  name            String    @map("name") @db.VarChar(150)
  slug            String    @unique @map("slug") @db.VarChar(180)
  description     String?   @map("description") @db.Text
  logo            String?   @map("logo") @db.VarChar(500)
  website         String?   @map("website") @db.VarChar(255)
  sort_order      Int       @default(0) @map("sort_order")
  seo_title       String?   @map("seo_title") @db.VarChar(255)
  seo_description String?   @map("seo_description") @db.VarChar(500)
  created_at      DateTime  @default(now()) @map("created_at")
  updated_at      DateTime  @updatedAt @map("updated_at")
  deleted_at      DateTime? @map("deleted_at")

  products Product[]

  @@index([sort_order])
  @@index([deleted_at])
  @@map("brands")
}

/// Danh mục sản phẩm nhiều cấp (self-reference qua parent_id).
/// Ví dụ: Robot hút bụi → Robot lau nhà / Robot hút bụi thông minh.
model Category {
  id              String    @id @default(cuid())
  parent_id       String?   @map("parent_id")
  name            String    @map("name") @db.VarChar(150)
  slug            String    @unique @map("slug") @db.VarChar(180)
  description     String?   @map("description") @db.Text
  image           String?   @map("image") @db.VarChar(500)
  sort_order      Int       @default(0) @map("sort_order")
  seo_title       String?   @map("seo_title") @db.VarChar(255)
  seo_description String?   @map("seo_description") @db.VarChar(500)
  created_at      DateTime  @default(now()) @map("created_at")
  updated_at      DateTime  @updatedAt @map("updated_at")
  deleted_at      DateTime? @map("deleted_at")

  parent   Category?  @relation("CategoryTree", fields: [parent_id], references: [id], onDelete: Restrict)
  children Category[] @relation("CategoryTree")
  products Product[]

  @@index([parent_id])
  @@index([sort_order])
  @@index([deleted_at])
  @@map("categories")
}

/// Sản phẩm gốc (SPU) — không lưu giá/stock tại đây.
/// Giá và tồn kho nằm ở ProductVariant để hỗ trợ nhiều phiên bản bán.
model Product {
  id                String        @id @default(cuid())
  brand_id          String        @map("brand_id")
  category_id       String        @map("category_id")
  slug              String        @unique @map("slug") @db.VarChar(220)
  sku               String        @unique @map("sku") @db.VarChar(80)
  name              String        @map("name") @db.VarChar(255)
  short_description String?       @map("short_description") @db.VarChar(500)
  description       String?       @map("description") @db.Text
  thumbnail         String?       @map("thumbnail") @db.VarChar(500)
  published         Boolean       @default(false) @map("published")
  featured          Boolean       @default(false) @map("featured")
  status            ProductStatus @default(DRAFT) @map("status")
  seo_title         String?       @map("seo_title") @db.VarChar(255)
  seo_description   String?       @map("seo_description") @db.VarChar(500)
  created_at        DateTime      @default(now()) @map("created_at")
  updated_at        DateTime      @updatedAt @map("updated_at")
  deleted_at        DateTime?     @map("deleted_at")

  brand      Brand            @relation(fields: [brand_id], references: [id], onDelete: Restrict)
  category   Category         @relation(fields: [category_id], references: [id], onDelete: Restrict)
  variants   ProductVariant[]
  images     ProductImage[]
  product_tags ProductTag[]

  @@index([brand_id])
  @@index([category_id])
  @@index([status])
  @@index([published])
  @@index([featured])
  @@index([created_at])
  @@index([deleted_at])
  @@map("products")
}

/// Biến thể bán hàng (SKU) của một Product — nơi lưu giá, sale_price, stock.
/// Ví dụ: Màu trắng / Bản quốc tế.
model ProductVariant {
  id         String        @id @default(cuid())
  product_id String        @map("product_id")
  sku        String        @unique @map("sku") @db.VarChar(80)
  barcode    String?       @unique @map("barcode") @db.VarChar(80)
  name       String?       @map("name") @db.VarChar(255)
  price      Decimal       @map("price") @db.Decimal(14, 2)
  sale_price Decimal?      @map("sale_price") @db.Decimal(14, 2)
  stock      Int           @default(0) @map("stock")
  weight     Decimal?      @map("weight") @db.Decimal(10, 3)
  image      String?       @map("image") @db.VarChar(500)
  status     VariantStatus @default(ACTIVE) @map("status")
  created_at DateTime      @default(now()) @map("created_at")
  updated_at DateTime      @updatedAt @map("updated_at")
  deleted_at DateTime?     @map("deleted_at")

  product            Product            @relation(fields: [product_id], references: [id], onDelete: Cascade)
  variant_attributes VariantAttribute[]

  @@index([product_id])
  @@index([status])
  @@index([price])
  @@index([deleted_at])
  @@map("product_variants")
}

/// Ảnh gallery của Product (không thuộc riêng một variant).
model ProductImage {
  id         String    @id @default(cuid())
  product_id String    @map("product_id")
  image_url  String    @map("image_url") @db.VarChar(500)
  alt_text   String?   @map("alt_text") @db.VarChar(255)
  sort_order Int       @default(0) @map("sort_order")
  created_at DateTime  @default(now()) @map("created_at")
  updated_at DateTime  @updatedAt @map("updated_at")
  deleted_at DateTime? @map("deleted_at")

  product Product @relation(fields: [product_id], references: [id], onDelete: Cascade)

  @@index([product_id, sort_order])
  @@map("product_images")
}

/// Thuộc tính catalog dùng chung (Màu sắc, Dung lượng pin, Lực hút, ...).
/// Tách khỏi Product để tái sử dụng khi filter / so sánh sản phẩm.
model ProductAttribute {
  id         String    @id @default(cuid())
  name       String    @map("name") @db.VarChar(100)
  slug       String    @unique @map("slug") @db.VarChar(120)
  sort_order Int       @default(0) @map("sort_order")
  created_at DateTime  @default(now()) @map("created_at")
  updated_at DateTime  @updatedAt @map("updated_at")
  deleted_at DateTime? @map("deleted_at")

  values ProductAttributeValue[]

  @@index([sort_order])
  @@map("product_attributes")
}

/// Giá trị cụ thể của một thuộc tính (Đen, Trắng, 5200mAh, ...).
model ProductAttributeValue {
  id           String    @id @default(cuid())
  attribute_id String    @map("attribute_id")
  value        String    @map("value") @db.VarChar(150)
  slug         String    @map("slug") @db.VarChar(180)
  sort_order   Int       @default(0) @map("sort_order")
  created_at   DateTime  @default(now()) @map("created_at")
  updated_at   DateTime  @updatedAt @map("updated_at")
  deleted_at   DateTime? @map("deleted_at")

  attribute          ProductAttribute   @relation(fields: [attribute_id], references: [id], onDelete: Cascade)
  variant_attributes VariantAttribute[]

  @@unique([attribute_id, slug])
  @@unique([attribute_id, value])
  @@index([attribute_id])
  @@map("product_attribute_values")
}

/// Liên kết Variant ↔ Attribute Value (VD: Variant A = Đen + Quốc tế).
/// Unique (variant_id, attribute_value_id) tránh gán trùng một giá trị.
model VariantAttribute {
  id                 String    @id @default(cuid())
  variant_id         String    @map("variant_id")
  attribute_value_id String    @map("attribute_value_id")
  created_at         DateTime  @default(now()) @map("created_at")
  updated_at         DateTime  @updatedAt @map("updated_at")
  deleted_at         DateTime? @map("deleted_at")

  variant         ProductVariant        @relation(fields: [variant_id], references: [id], onDelete: Cascade)
  attribute_value ProductAttributeValue @relation(fields: [attribute_value_id], references: [id], onDelete: Restrict)

  @@unique([variant_id, attribute_value_id])
  @@index([variant_id])
  @@index([attribute_value_id])
  @@map("variant_attributes")
}

/// Tag dùng chung cho Product / Post / Thread (normalize, tránh duplicate tên tag).
model Tag {
  id              String    @id @default(cuid())
  name            String    @map("name") @db.VarChar(100)
  slug            String    @unique @map("slug") @db.VarChar(120)
  seo_title       String?   @map("seo_title") @db.VarChar(255)
  seo_description String?   @map("seo_description") @db.VarChar(500)
  created_at      DateTime  @default(now()) @map("created_at")
  updated_at      DateTime  @updatedAt @map("updated_at")
  deleted_at      DateTime? @map("deleted_at")

  product_tags ProductTag[]
  post_tags    PostTag[]
  thread_tags  ThreadTag[]

  @@map("tags")
}

/// Junction Product ↔ Tag (many-to-many).
model ProductTag {
  id         String    @id @default(cuid())
  product_id String    @map("product_id")
  tag_id     String    @map("tag_id")
  created_at DateTime  @default(now()) @map("created_at")
  updated_at DateTime  @updatedAt @map("updated_at")
  deleted_at DateTime? @map("deleted_at")

  product Product @relation(fields: [product_id], references: [id], onDelete: Cascade)
  tag     Tag     @relation(fields: [tag_id], references: [id], onDelete: Cascade)

  @@unique([product_id, tag_id])
  @@index([tag_id])
  @@map("product_tags")
}

// =============================================================================
// BLOG / CMS
// =============================================================================

/// Danh mục bài viết blog — hỗ trợ nhiều cấp (parent_id).
model PostCategory {
  id              String    @id @default(cuid())
  parent_id       String?   @map("parent_id")
  name            String    @map("name") @db.VarChar(150)
  slug            String    @unique @map("slug") @db.VarChar(180)
  description     String?   @map("description") @db.Text
  sort_order      Int       @default(0) @map("sort_order")
  seo_title       String?   @map("seo_title") @db.VarChar(255)
  seo_description String?   @map("seo_description") @db.VarChar(500)
  created_at      DateTime  @default(now()) @map("created_at")
  updated_at      DateTime  @updatedAt @map("updated_at")
  deleted_at      DateTime? @map("deleted_at")

  parent   PostCategory?  @relation("PostCategoryTree", fields: [parent_id], references: [id], onDelete: Restrict)
  children PostCategory[] @relation("PostCategoryTree")
  posts    Post[]

  @@index([parent_id])
  @@index([sort_order])
  @@index([deleted_at])
  @@map("post_categories")
}

/// Bài viết blog/CMS — gắn author + category, có SEO và views counter.
model Post {
  id              String     @id @default(cuid())
  author_id       String     @map("author_id")
  category_id     String     @map("category_id")
  slug            String     @unique @map("slug") @db.VarChar(220)
  title           String     @map("title") @db.VarChar(255)
  summary         String?    @map("summary") @db.VarChar(500)
  content         String     @map("content") @db.Text
  thumbnail       String?    @map("thumbnail") @db.VarChar(500)
  status          PostStatus @default(DRAFT) @map("status")
  published_at    DateTime?  @map("published_at")
  views           Int        @default(0) @map("views")
  seo_title       String?    @map("seo_title") @db.VarChar(255)
  seo_description String?    @map("seo_description") @db.VarChar(500)
  created_at      DateTime   @default(now()) @map("created_at")
  updated_at      DateTime   @updatedAt @map("updated_at")
  deleted_at      DateTime?  @map("deleted_at")

  author     User         @relation("PostAuthor", fields: [author_id], references: [id], onDelete: Restrict)
  category   PostCategory @relation(fields: [category_id], references: [id], onDelete: Restrict)
  post_tags  PostTag[]

  @@index([author_id])
  @@index([category_id])
  @@index([status])
  @@index([published_at])
  @@index([created_at])
  @@index([deleted_at])
  @@map("posts")
}

/// Junction Post ↔ Tag (many-to-many).
model PostTag {
  id         String    @id @default(cuid())
  post_id    String    @map("post_id")
  tag_id     String    @map("tag_id")
  created_at DateTime  @default(now()) @map("created_at")
  updated_at DateTime  @updatedAt @map("updated_at")
  deleted_at DateTime? @map("deleted_at")

  post Post @relation(fields: [post_id], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tag_id], references: [id], onDelete: Cascade)

  @@unique([post_id, tag_id])
  @@index([tag_id])
  @@map("post_tags")
}

// =============================================================================
// COMMENT (polymorphic: Blog Post + Product)
// =============================================================================

/// Bình luận đa hình — target_type + target_id trỏ tới PRODUCT hoặc POST.
/// parent_id cho phép reply nhiều cấp. Không FK cứng tới target (Prisma hạn chế polymorphic).
model Comment {
  id          String        @id @default(cuid())
  parent_id   String?       @map("parent_id")
  user_id     String        @map("user_id")
  target_type TargetType    @map("target_type")
  target_id   String        @map("target_id")
  content     String        @map("content") @db.Text
  status      CommentStatus @default(PENDING) @map("status")
  created_at  DateTime      @default(now()) @map("created_at")
  updated_at  DateTime      @updatedAt @map("updated_at")
  deleted_at  DateTime?     @map("deleted_at")

  user     User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  parent   Comment?  @relation("CommentTree", fields: [parent_id], references: [id], onDelete: Cascade)
  children Comment[] @relation("CommentTree")

  @@index([user_id])
  @@index([parent_id])
  @@index([target_type, target_id])
  @@index([status])
  @@index([created_at])
  @@index([deleted_at])
  @@map("comments")
}

// =============================================================================
// FORUM (cấu trúc kiểu XenForo)
// Category → Forum → Thread → ForumPost
// =============================================================================

/// Nhóm chuyên mục forum (chỉ để nhóm hiển thị, không chứa bài viết trực tiếp).
model ForumCategory {
  id              String    @id @default(cuid())
  name            String    @map("name") @db.VarChar(150)
  slug            String    @unique @map("slug") @db.VarChar(180)
  description     String?   @map("description") @db.Text
  sort_order      Int       @default(0) @map("sort_order")
  seo_title       String?   @map("seo_title") @db.VarChar(255)
  seo_description String?   @map("seo_description") @db.VarChar(500)
  created_at      DateTime  @default(now()) @map("created_at")
  updated_at      DateTime  @updatedAt @map("updated_at")
  deleted_at      DateTime? @map("deleted_at")

  forums Forum[]

  @@index([sort_order])
  @@index([deleted_at])
  @@map("forum_categories")
}

/// Chuyên mục forum — lưu sẵn thread_count / post_count / last_* để tối ưu list.
/// last_thread_id / last_post_id dùng SetNull khi thread/post bị xóa cứng.
model Forum {
  id              String    @id @default(cuid())
  category_id     String    @map("category_id")
  name            String    @map("name") @db.VarChar(150)
  slug            String    @unique @map("slug") @db.VarChar(180)
  description     String?   @map("description") @db.Text
  icon            String?   @map("icon") @db.VarChar(500)
  thread_count    Int       @default(0) @map("thread_count")
  post_count      Int       @default(0) @map("post_count")
  last_thread_id  String?   @unique @map("last_thread_id")
  last_post_id    String?   @unique @map("last_post_id")
  sort_order      Int       @default(0) @map("sort_order")
  seo_title       String?   @map("seo_title") @db.VarChar(255)
  seo_description String?   @map("seo_description") @db.VarChar(500)
  created_at      DateTime  @default(now()) @map("created_at")
  updated_at      DateTime  @updatedAt @map("updated_at")
  deleted_at      DateTime? @map("deleted_at")

  category    ForumCategory @relation(fields: [category_id], references: [id], onDelete: Restrict)
  threads     Thread[]
  last_thread Thread?       @relation("ForumLastThread", fields: [last_thread_id], references: [id], onDelete: SetNull)
  last_post   ForumPost?    @relation("ForumLastPost", fields: [last_post_id], references: [id], onDelete: SetNull)

  @@index([category_id])
  @@index([sort_order])
  @@index([deleted_at])
  @@map("forums")
}

/// Chủ đề forum — content là bài mở đầu; reply nằm ở ForumPost.
/// Counter reply_count / last_reply_* cập nhật khi có bài mới (denormalize có chủ đích).
model Thread {
  id                 String       @id @default(cuid())
  forum_id           String       @map("forum_id")
  user_id            String       @map("user_id")
  title              String       @map("title") @db.VarChar(255)
  slug               String       @map("slug") @db.VarChar(220)
  content            String       @map("content") @db.Text
  views              Int          @default(0) @map("views")
  reply_count        Int          @default(0) @map("reply_count")
  last_reply_at      DateTime?    @map("last_reply_at")
  last_reply_user_id String?      @map("last_reply_user_id")
  is_pinned          Boolean      @default(false) @map("is_pinned")
  is_locked          Boolean      @default(false) @map("is_locked")
  status             ThreadStatus @default(OPEN) @map("status")
  seo_title          String?      @map("seo_title") @db.VarChar(255)
  seo_description    String?      @map("seo_description") @db.VarChar(500)
  created_at         DateTime     @default(now()) @map("created_at")
  updated_at         DateTime     @updatedAt @map("updated_at")
  deleted_at         DateTime?    @map("deleted_at")

  forum            Forum       @relation(fields: [forum_id], references: [id], onDelete: Restrict)
  user             User        @relation("ThreadAuthor", fields: [user_id], references: [id], onDelete: Restrict)
  last_reply_user  User?       @relation("ThreadLastReplyUser", fields: [last_reply_user_id], references: [id], onDelete: SetNull)
  posts            ForumPost[]
  thread_tags      ThreadTag[]
  forum_as_last    Forum?      @relation("ForumLastThread")

  @@unique([forum_id, slug])
  @@index([forum_id])
  @@index([user_id])
  @@index([status])
  @@index([is_pinned])
  @@index([last_reply_at])
  @@index([created_at])
  @@index([deleted_at])
  @@map("threads")
}

/// Bài trả lời trong Thread (tương đương XenForo post).
/// reply_to_post_id cho phép quote/reply tới một post cụ thể.
model ForumPost {
  id               String    @id @default(cuid())
  thread_id        String    @map("thread_id")
  user_id          String    @map("user_id")
  content          String    @map("content") @db.Text
  reply_to_post_id String?   @map("reply_to_post_id")
  edited_at        DateTime? @map("edited_at")
  created_at       DateTime  @default(now()) @map("created_at")
  updated_at       DateTime  @updatedAt @map("updated_at")
  deleted_at       DateTime? @map("deleted_at")

  thread         Thread     @relation(fields: [thread_id], references: [id], onDelete: Cascade)
  user           User       @relation("ForumPostAuthor", fields: [user_id], references: [id], onDelete: Restrict)
  reply_to_post  ForumPost? @relation("ForumPostReply", fields: [reply_to_post_id], references: [id], onDelete: SetNull)
  replies        ForumPost[] @relation("ForumPostReply")
  forum_as_last  Forum?     @relation("ForumLastPost")

  @@index([thread_id])
  @@index([user_id])
  @@index([reply_to_post_id])
  @@index([created_at])
  @@index([deleted_at])
  @@map("forum_posts")
}

/// Junction Thread ↔ Tag (many-to-many) — Review, Hỏi đáp, Dreame, ...
model ThreadTag {
  id         String    @id @default(cuid())
  thread_id  String    @map("thread_id")
  tag_id     String    @map("tag_id")
  created_at DateTime  @default(now()) @map("created_at")
  updated_at DateTime  @updatedAt @map("updated_at")
  deleted_at DateTime? @map("deleted_at")

  thread Thread @relation(fields: [thread_id], references: [id], onDelete: Cascade)
  tag    Tag    @relation(fields: [tag_id], references: [id], onDelete: Cascade)

  @@unique([thread_id, tag_id])
  @@index([tag_id])
  @@map("thread_tags")
}

// =============================================================================
// FAVORITE (polymorphic: Product / Blog Post / Thread)
// =============================================================================

/// Mục yêu thích đa hình — mỗi user chỉ favorite một target một lần.
model Favorite {
  id          String     @id @default(cuid())
  user_id     String     @map("user_id")
  target_type TargetType @map("target_type")
  target_id   String     @map("target_id")
  created_at  DateTime   @default(now()) @map("created_at")
  updated_at  DateTime   @updatedAt @map("updated_at")
  deleted_at  DateTime?  @map("deleted_at")

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([user_id, target_type, target_id])
  @@index([target_type, target_id])
  @@index([created_at])
  @@map("favorites")
}

// =============================================================================
// REACTION (polymorphic: Forum Post / Comment)
// =============================================================================

/// Reaction của user lên ForumPost hoặc Comment.
/// Unique (user, target, type) — một user một loại reaction trên một đối tượng.
model Reaction {
  id            String       @id @default(cuid())
  user_id       String       @map("user_id")
  target_type   TargetType   @map("target_type")
  target_id     String       @map("target_id")
  reaction_type ReactionType @map("reaction_type")
  created_at    DateTime     @default(now()) @map("created_at")
  updated_at    DateTime     @updatedAt @map("updated_at")
  deleted_at    DateTime?    @map("deleted_at")

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([user_id, target_type, target_id, reaction_type])
  @@index([target_type, target_id])
  @@index([reaction_type])
  @@map("reactions")
}

// =============================================================================
// AUDIT LOG
// =============================================================================

/// Nhật ký thao tác admin/mod — phục vụ truy vết Login, CRUD Product/Thread, ...
/// entity_type + entity_id mô tả đối tượng bị tác động; metadata lưu JSON chi tiết.
// model AuditLog {
//   id          String      @id @default(cuid())
//   actor_id    String?     @map("actor_id")
//   action      AuditAction @map("action")
//   entity_type String      @map("entity_type") @db.VarChar(80)
//   entity_id   String?     @map("entity_id")
//   ip_address  String?     @map("ip_address") @db.VarChar(45)
//   user_agent  String?     @map("user_agent") @db.VarChar(500)
//   metadata    Json?       @map("metadata")
//   created_at  DateTime    @default(now()) @map("created_at")
//   updated_at  DateTime    @updatedAt @map("updated_at")
//   deleted_at  DateTime?   @map("deleted_at")

//   actor User? @relation("AuditActor", fields: [actor_id], references: [id], onDelete: SetNull)

//   @@index([actor_id])
//   @@index([action])
//   @@index([entity_type, entity_id])
//   @@index([created_at])
//   @@map("audit_logs")
// }
