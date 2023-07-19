/*
  Warnings:

  - You are about to alter the column `status` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `order` MODIFY `status` ENUM('Producent', 'Magazyn', 'Dostawa', 'Pobranie', 'Zrealizowane', 'Cancelled') NOT NULL DEFAULT 'Producent';
