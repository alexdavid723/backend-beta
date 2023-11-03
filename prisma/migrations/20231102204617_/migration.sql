/*
  Warnings:

  - Added the required column `urlformaspago` to the `FormasPago` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlpaquete` to the `PaqueteDeVuelo` table without a default value. This is not possible if the table is not empty.
  - Made the column `estado` on table `paquetedevuelo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `formaspago` ADD COLUMN `urlformaspago` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `paquetedevuelo` ADD COLUMN `urlpaquete` VARCHAR(191) NOT NULL,
    MODIFY `estado` BOOLEAN NOT NULL;
