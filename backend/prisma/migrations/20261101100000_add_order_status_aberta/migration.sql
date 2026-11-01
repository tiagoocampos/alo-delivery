-- AlterEnum
-- Migration separada de propósito: o Postgres não deixa usar um valor de enum
-- recém-adicionado (ex.: no índice parcial) na mesma transação em que ele nasce.
ALTER TYPE "OrderStatus" ADD VALUE 'aberta';
