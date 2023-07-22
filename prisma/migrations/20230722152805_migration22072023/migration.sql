/*
  Warnings:

  - The values [ProdReturn,Collect,Delivery] on the enum `Order_orderType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `commodityPrice` on the `package` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `currency` VARCHAR(191) NULL,
    MODIFY `orderType` ENUM('Zwrot', 'Odbior', 'Dostawa') NOT NULL;

-- AlterTable
ALTER TABLE `package` MODIFY `commodityPrice` INTEGER NULL;
