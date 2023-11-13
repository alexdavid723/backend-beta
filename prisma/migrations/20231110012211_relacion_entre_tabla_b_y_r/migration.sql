-- AlterTable
ALTER TABLE `boardingpass` ADD COLUMN `reservaId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `BoardingPass` ADD CONSTRAINT `BoardingPass_reservaId_fkey` FOREIGN KEY (`reservaId`) REFERENCES `Reserva`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
