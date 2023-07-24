/*
  Warnings:

  - You are about to alter the column `commodityPrice` on the `package` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `package` MODIFY `commodityPrice` DOUBLE NULL;
