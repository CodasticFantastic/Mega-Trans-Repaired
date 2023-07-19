/*
  Warnings:

  - The values [Cancelled] on the enum `Order_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `order` MODIFY `status` ENUM('Producent', 'Magazyn', 'Dostawa', 'Pobranie', 'Zrealizowane', 'Anulowane') NOT NULL DEFAULT 'Producent';
