/*
  Warnings:

  - The primary key for the `order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `package` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `package` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[packageId]` on the table `Package` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `commodityName` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commodityPaymentType` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commodityType` to the `Package` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageId` to the `Package` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `package` DROP FOREIGN KEY `Package_orderId_fkey`;

-- AlterTable
ALTER TABLE `order` DROP PRIMARY KEY,
    MODIFY `orderFlatNumber` VARCHAR(191) NULL,
    MODIFY `orderId` VARCHAR(191) NOT NULL,
    MODIFY `orderNote` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`orderId`);

-- AlterTable
ALTER TABLE `package` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `commodityName` VARCHAR(191) NOT NULL,
    ADD COLUMN `commodityNote` VARCHAR(191) NULL,
    ADD COLUMN `commodityPaymentType` ENUM('Pobranie', 'Przelew') NOT NULL,
    ADD COLUMN `commodityPrice` VARCHAR(191) NULL,
    ADD COLUMN `commodityType` ENUM('Paczka', 'Gabaryt', 'Paleta') NOT NULL,
    ADD COLUMN `packageId` VARCHAR(191) NOT NULL,
    MODIFY `orderId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`packageId`);

-- CreateIndex
CREATE UNIQUE INDEX `Order_orderId_key` ON `Order`(`orderId`);

-- CreateIndex
CREATE UNIQUE INDEX `Package_packageId_key` ON `Package`(`packageId`);

-- AddForeignKey
ALTER TABLE `Package` ADD CONSTRAINT `Package_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`orderId`) ON DELETE RESTRICT ON UPDATE CASCADE;
