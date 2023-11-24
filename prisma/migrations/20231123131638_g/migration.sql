/*
  Warnings:

  - You are about to drop the column `horaInicio` on the `reserva` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `reserva` DROP COLUMN `horaInicio`,
    MODIFY `fechaInicio` DATETIME(3) NOT NULL;
