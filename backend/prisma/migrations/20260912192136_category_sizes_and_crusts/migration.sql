-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_crust_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_crusts" DROP CONSTRAINT "product_crusts_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_flavors" DROP CONSTRAINT "product_flavors_product_id_fkey";

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "crust_id",
DROP COLUMN "selected_flavors",
ADD COLUMN     "category_crust_id" TEXT,
ADD COLUMN     "category_size_id" TEXT,
ALTER COLUMN "product_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "max_flavors";

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "base_price" DROP NOT NULL;

-- DropTable
DROP TABLE "product_crusts";

-- DropTable
DROP TABLE "product_flavors";

-- CreateTable
CREATE TABLE "category_sizes" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "max_flavors" INTEGER NOT NULL,

    CONSTRAINT "category_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_crusts" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_delta" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "category_crusts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_flavors" (
    "id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,

    CONSTRAINT "order_item_flavors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "category_sizes_category_id_idx" ON "category_sizes"("category_id");

-- CreateIndex
CREATE INDEX "category_crusts_category_id_idx" ON "category_crusts"("category_id");

-- CreateIndex
CREATE INDEX "order_item_flavors_order_item_id_idx" ON "order_item_flavors"("order_item_id");

-- AddForeignKey
ALTER TABLE "category_sizes" ADD CONSTRAINT "category_sizes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_crusts" ADD CONSTRAINT "category_crusts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_category_size_id_fkey" FOREIGN KEY ("category_size_id") REFERENCES "category_sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_category_crust_id_fkey" FOREIGN KEY ("category_crust_id") REFERENCES "category_crusts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_flavors" ADD CONSTRAINT "order_item_flavors_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_flavors" ADD CONSTRAINT "order_item_flavors_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

