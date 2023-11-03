/*
  Warnings:

  - You are about to drop the column `urlformaspago` on the `formaspago` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `formaspago` DROP COLUMN `urlformaspago`,
    MODIFY `imagen` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `paquetedevuelo` MODIFY `imagen` VARCHAR(191) NULL;
