-- CreateEnum
CREATE TYPE "OrderOrigin" AS ENUM ('online', 'balcao');

-- CreateEnum
CREATE TYPE "ProductAvailability" AS ENUM ('ambos', 'delivery', 'balcao');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'dinheiro';
ALTER TYPE "PaymentMethod" ADD VALUE 'pix';
ALTER TYPE "PaymentMethod" ADD VALUE 'cartao_debito';
ALTER TYPE "PaymentMethod" ADD VALUE 'cartao_credito';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "availability" "ProductAvailability" NOT NULL DEFAULT 'ambos';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "client_id" TEXT,
ADD COLUMN     "origin" "OrderOrigin" NOT NULL DEFAULT 'online',
ALTER COLUMN "customer_phone" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "name" TEXT;

-- CreateIndex
CREATE INDEX "orders_tenant_id_origin_created_at_idx" ON "orders"("tenant_id", "origin", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "orders_tenant_id_client_id_key" ON "orders"("tenant_id", "client_id");

