-- AlterTable
ALTER TABLE `ApiKey` ADD COLUMN `type` ENUM('BaseLinker', 'CustomIntegration') NOT NULL DEFAULT 'CustomIntegration';
