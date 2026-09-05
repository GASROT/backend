-- Carrinho e pedidos passam a pertencer a um usuario.
-- As linhas existentes foram criadas no modelo global (sem dono) e nao podem ser
-- atribuidas retroativamente, entao sao descartadas.
DELETE FROM "OrderItem";
DELETE FROM "Order";
DELETE FROM "CartItem";

-- CartItem: chave composta (userId, productId), permitindo um carrinho por usuario.
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_pkey";
ALTER TABLE "CartItem" ADD COLUMN "userId" TEXT NOT NULL;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY ("userId", "productId");

CREATE INDEX "CartItem_userId_idx" ON "CartItem"("userId");

ALTER TABLE "CartItem"
ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId")
REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Order: passa a ter dono.
ALTER TABLE "Order" ADD COLUMN "userId" TEXT NOT NULL;

CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

ALTER TABLE "Order"
ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId")
REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
