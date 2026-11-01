-- AlterTable
-- payment_method fica nullable: mesa aberta ainda não tem forma de pagamento.
ALTER TABLE "orders" ADD COLUMN     "closed_at" TIMESTAMP(3),
ADD COLUMN     "table_label" TEXT,
ALTER COLUMN "payment_method" DROP NOT NULL;

-- Backfill: vendas de balcão já existentes (todas fechadas ou canceladas)
-- passam a ter closed_at = created_at, que era o que definia o dia delas.
UPDATE "orders"
SET "closed_at" = "created_at"
WHERE "origin" = 'balcao' AND "closed_at" IS NULL;

-- CreateIndex
CREATE INDEX "orders_tenant_id_origin_closed_at_idx" ON "orders"("tenant_id", "origin", "closed_at");

-- Uma única mesa aberta por nome (case-insensitive) em cada loja. Índice parcial:
-- o Prisma não consegue modelar, então vive só aqui no SQL. Mesa fechada ou
-- cancelada não entra no índice, então o nome pode ser reaproveitado.
CREATE UNIQUE INDEX "orders_open_table_label_key"
ON "orders" ("tenant_id", lower("table_label"))
WHERE "status" = 'aberta' AND "table_label" IS NOT NULL;
