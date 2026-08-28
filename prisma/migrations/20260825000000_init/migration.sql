CREATE TYPE "ProductCategory" AS ENUM ('fertilizante', 'defensivo', 'semente', 'irrigacao', 'maquinario', 'nutricao');
CREATE TYPE "ProductUnit" AS ENUM ('kg', 'L', 'sc', 'un');
CREATE TYPE "ToxicClass" AS ENUM ('I', 'II', 'III', 'IV');
CREATE TYPE "MediaType" AS ENUM ('image', 'video');
CREATE TYPE "OrderStatus" AS ENUM ('PENDENTE', 'CONFIRMADO', 'SEPARANDO', 'ENVIADO', 'ENTREGUE', 'CANCELADO');

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "manufacturer" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "category" "ProductCategory" NOT NULL,
  "subcategory" TEXT NOT NULL,
  "npk" TEXT,
  "dosage" TEXT NOT NULL,
  "unit" "ProductUnit" NOT NULL,
  "packageSize" TEXT NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "oldPrice" DECIMAL(10,2),
  "pmf" DECIMAL(10,2),
  "wholesalePrice" DECIMAL(10,2),
  "rating" DECIMAL(2,1) NOT NULL,
  "reviews" INTEGER NOT NULL,
  "stock" INTEGER NOT NULL,
  "minMultiple" INTEGER NOT NULL DEFAULT 1,
  "mapa" TEXT,
  "toxicClass" "ToxicClass",
  "requiresAgronomistCpf" BOOLEAN NOT NULL DEFAULT false,
  "technicalSheetUrl" TEXT NOT NULL,
  "seasonalStartsAt" TIMESTAMP(3),
  "seasonalEndsAt" TIMESTAMP(3),
  "description" TEXT NOT NULL,
  "application" TEXT NOT NULL,
  "marker" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductMedia" (
  "id" TEXT NOT NULL,
  "type" "MediaType" NOT NULL,
  "title" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FeaturedBanner" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "discountLabel" TEXT NOT NULL,
  "priority" INTEGER NOT NULL,
  CONSTRAINT "FeaturedBanner_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CartItem" (
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CartItem_pkey" PRIMARY KEY ("productId")
);

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "subtotal" DECIMAL(10,2) NOT NULL,
  "discount" DECIMAL(10,2) NOT NULL,
  "shipping" DECIMAL(10,2) NOT NULL,
  "total" DECIMAL(10,2) NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "shippingMethod" TEXT NOT NULL,
  "deliveryAddress" TEXT NOT NULL,
  "trackingCode" TEXT,
  "carrier" TEXT,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" DECIMAL(10,2) NOT NULL,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeaturedBanner" ADD CONSTRAINT "FeaturedBanner_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
