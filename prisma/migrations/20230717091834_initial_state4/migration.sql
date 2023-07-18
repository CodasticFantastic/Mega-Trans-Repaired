/*
  Warnings:

  - The primary key for the `order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `order` table. All the data in the column will be lost.
  - You are about to drop the `packages` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `orderCity` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderCountry` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderFlatNumber` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderNote` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderPostCode` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderState` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderStreet` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderStreetNumber` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderType` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientEmail` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientPhone` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `packages` DROP FOREIGN KEY `Packages_orderId_fkey`;

-- AlterTable
ALTER TABLE `order` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `orderCity` VARCHAR(191) NOT NULL,
    ADD COLUMN `orderCountry` VARCHAR(191) NOT NULL,
    ADD COLUMN `orderFlatNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `orderId` INTEGER NOT NULL,
    ADD COLUMN `orderNote` VARCHAR(191) NOT NULL,
    ADD COLUMN `orderPostCode` VARCHAR(191) NOT NULL,
    ADD COLUMN `orderState` VARCHAR(191) NOT NULL,
    ADD COLUMN `orderStreet` VARCHAR(191) NOT NULL,
    ADD COLUMN `orderStreetNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `orderType` ENUM('ProdReturn', 'Collect', 'Delivery') NOT NULL,
    ADD COLUMN `recipientEmail` VARCHAR(191) NOT NULL,
    ADD COLUMN `recipientName` VARCHAR(191) NOT NULL,
    ADD COLUMN `recipientPhone` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('Producer', 'Warehouse', 'Delivery', 'Realized', 'PaidToProducer', 'Cancelled') NOT NULL DEFAULT 'Producer',
    ADD PRIMARY KEY (`orderId`);

-- DropTable
DROP TABLE `packages`;

-- CreateTable
CREATE TABLE `Package` (
    `id` INTEGER NOT NULL,
    `orderId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Package` ADD CONSTRAINT `Package_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`orderId`) ON DELETE RESTRICT ON UPDATE CASCADE;
