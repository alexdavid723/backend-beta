/*
  Warnings:

  - Added the required column `horaInicio` to the `Reserva` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `reserva` ADD COLUMN `horaInicio` TIME NOT NULL,
    MODIFY `fechaInicio` DATE NOT NULL;
