/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Driver_name_key` ON `Driver`(`name`);
