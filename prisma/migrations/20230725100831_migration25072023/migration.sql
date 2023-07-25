-- AlterTable
ALTER TABLE `order` ADD COLUMN `courierId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_courierId_fkey` FOREIGN KEY (`courierId`) REFERENCES `Driver`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
