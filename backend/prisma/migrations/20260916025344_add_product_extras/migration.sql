-- CreateTable
CREATE TABLE "product_extras" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "product_extras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_extras" (
    "id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "product_extra_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "order_item_extras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_extras_product_id_idx" ON "product_extras"("product_id");

-- CreateIndex
CREATE INDEX "order_item_extras_order_item_id_idx" ON "order_item_extras"("order_item_id");

-- AddForeignKey
ALTER TABLE "product_extras" ADD CONSTRAINT "product_extras_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_extras" ADD CONSTRAINT "order_item_extras_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_extras" ADD CONSTRAINT "order_item_extras_product_extra_id_fkey" FOREIGN KEY ("product_extra_id") REFERENCES "product_extras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
