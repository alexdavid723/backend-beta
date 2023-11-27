/*
  Warnings:

  - You are about to drop the column `correoCliente` on the `reserva` table. All the data in the column will be lost.
  - You are about to alter the column `horaInicio` on the `reserva` table. The data in that column could be lost. The data in that column will be cast from `Time(0)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `reserva` DROP COLUMN `correoCliente`,
    MODIFY `fechaInicio` DATETIME(3) NOT NULL,
    MODIFY `horaInicio` DATETIME(3) NOT NULL;
