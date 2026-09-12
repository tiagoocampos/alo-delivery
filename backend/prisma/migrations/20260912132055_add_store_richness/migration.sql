-- CreateEnum
CREATE TYPE "ProductBadge" AS ENUM ('mais_pedido', 'promocao', 'novo');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "badge" "ProductBadge";

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "address" TEXT,
ADD COLUMN     "business_hours" JSONB,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "instagram_url" TEXT,
ADD COLUMN     "minimum_order_value" INTEGER NOT NULL DEFAULT 0;
