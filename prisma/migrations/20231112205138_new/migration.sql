/*
  Warnings:

  - You are about to drop the column `imagenComprobante` on the `reserva` table. All the data in the column will be lost.
  - You are about to drop the `usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `reserva` DROP COLUMN `imagenComprobante`;

-- DropTable
DROP TABLE `usuario`;

-- CreateTable
CREATE TABLE `ImagenReserva` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reservaId` INTEGER NOT NULL,
    `imagenUrl` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ImagenReserva` ADD CONSTRAINT `ImagenReserva_reservaId_fkey` FOREIGN KEY (`reservaId`) REFERENCES `Reserva`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
