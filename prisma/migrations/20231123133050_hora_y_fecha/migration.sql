/*
  Warnings:

  - The `horaInicio` column on the `reserva` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE `reserva` DROP COLUMN `horaInicio`,
    ADD COLUMN `horaInicio` TIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
