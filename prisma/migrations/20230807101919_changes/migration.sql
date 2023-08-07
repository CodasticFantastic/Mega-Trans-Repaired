/*
  Warnings:

  - You are about to drop the column `commodityPaymentType` on the `package` table. All the data in the column will be lost.
  - You are about to drop the column `commodityPrice` on the `package` table. All the data in the column will be lost.
  - Added the required column `orderPaymentType` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `orderPaymentType` ENUM('Pobranie', 'Przelew') NOT NULL,
    ADD COLUMN `orderPrice` DOUBLE NULL;

-- AlterTable
ALTER TABLE `package` DROP COLUMN `commodityPaymentType`,
    DROP COLUMN `commodityPrice`;
