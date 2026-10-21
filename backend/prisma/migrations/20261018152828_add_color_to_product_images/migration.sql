-- DropIndex
DROP INDEX "ProductImage_productId_idx";

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "color" TEXT;

-- CreateIndex
CREATE INDEX "ProductImage_productId_color_sortOrder_idx" ON "ProductImage"("productId", "color", "sortOrder");
