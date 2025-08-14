-- AlterTable
ALTER TABLE `Order` ADD COLUMN `order_source` ENUM('BaseLinker', 'CustomIntegration', 'Manual') NOT NULL DEFAULT 'Manual';
