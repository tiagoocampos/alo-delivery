-- CreateTable
CREATE TABLE "order_push_subscriptions" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh_key" TEXT NOT NULL,
    "auth_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_push_subscriptions_order_id_idx" ON "order_push_subscriptions"("order_id");

-- AddForeignKey
ALTER TABLE "order_push_subscriptions" ADD CONSTRAINT "order_push_subscriptions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
