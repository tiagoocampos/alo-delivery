-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "crust_id" TEXT,
ADD COLUMN     "selected_flavors" JSONB;

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "max_flavors" INTEGER;

-- CreateTable
CREATE TABLE "product_flavors" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "product_flavors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_crusts" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_delta" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_crusts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_flavors_product_id_idx" ON "product_flavors"("product_id");

-- CreateIndex
CREATE INDEX "product_crusts_product_id_idx" ON "product_crusts"("product_id");

-- AddForeignKey
ALTER TABLE "product_flavors" ADD CONSTRAINT "product_flavors_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_crusts" ADD CONSTRAINT "product_crusts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_crust_id_fkey" FOREIGN KEY ("crust_id") REFERENCES "product_crusts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
