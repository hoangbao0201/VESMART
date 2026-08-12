-- CreateTable
CREATE TABLE "image_categories" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "image_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "r2_key" VARCHAR(500) NOT NULL,
    "description" VARCHAR(500),
    "source_url" VARCHAR(1000),
    "mime" VARCHAR(100),
    "bytes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "image_categories_slug_key" ON "image_categories"("slug");

-- CreateIndex
CREATE INDEX "image_categories_parent_id_idx" ON "image_categories"("parent_id");

-- CreateIndex
CREATE INDEX "image_categories_sort_order_idx" ON "image_categories"("sort_order");

-- CreateIndex
CREATE INDEX "image_categories_deleted_at_idx" ON "image_categories"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "images_source_url_key" ON "images"("source_url");

-- CreateIndex
CREATE INDEX "images_category_id_idx" ON "images"("category_id");

-- CreateIndex
CREATE INDEX "images_created_at_idx" ON "images"("created_at");

-- CreateIndex
CREATE INDEX "images_deleted_at_idx" ON "images"("deleted_at");

-- AddForeignKey
ALTER TABLE "image_categories" ADD CONSTRAINT "image_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "image_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "image_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
