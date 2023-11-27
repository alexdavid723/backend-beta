/*
  Warnings:

  - Added the required column `correoCliente` to the `Reserva` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `reserva` ADD COLUMN `correoCliente` VARCHAR(191) NOT NULL;
