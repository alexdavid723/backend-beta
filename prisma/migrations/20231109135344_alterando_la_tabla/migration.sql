/*
  Warnings:

  - Made the column `fechaInicio` on table `reserva` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nombreCliente` on table `reserva` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cantidadPasajeros` on table `reserva` required. This step will fail if there are existing NULL values in that column.
  - Made the column `telefonoCliente` on table `reserva` required. This step will fail if there are existing NULL values in that column.
  - Made the column `correoCliente` on table `reserva` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `reserva` MODIFY `fechaInicio` DATETIME(3) NOT NULL,
    MODIFY `nombreCliente` VARCHAR(191) NOT NULL,
    MODIFY `cantidadPasajeros` INTEGER NOT NULL,
    MODIFY `telefonoCliente` VARCHAR(191) NOT NULL,
    MODIFY `correoCliente` VARCHAR(191) NOT NULL;
