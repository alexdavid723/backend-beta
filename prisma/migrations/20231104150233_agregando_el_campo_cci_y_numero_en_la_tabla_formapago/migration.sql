/*
  Warnings:

  - Added the required column `cci` to the `FormasPago` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `FormasPago` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `FormasPago` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero` to the `FormasPago` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `formaspago` ADD COLUMN `cci` VARCHAR(191) NOT NULL,
    ADD COLUMN `estado` BOOLEAN NOT NULL,
    ADD COLUMN `nombre` VARCHAR(191) NOT NULL,
    ADD COLUMN `numero` INTEGER NOT NULL;
