-- CreateEnum
CREATE TYPE "CanceledBy" AS ENUM ('customer', 'store');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "cancel_reason" TEXT,
ADD COLUMN     "canceled_by" "CanceledBy";
