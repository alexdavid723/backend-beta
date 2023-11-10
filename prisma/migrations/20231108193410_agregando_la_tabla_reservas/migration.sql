-- CreateTable
CREATE TABLE `Reserva` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fechaReserva` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaInicio` DATETIME(3) NULL,
    `nombreCliente` VARCHAR(191) NULL,
    `cantidadPasajeros` INTEGER NULL,
    `telefonoCliente` VARCHAR(191) NULL,
    `correoCliente` VARCHAR(191) NULL,
    `imagenComprobante` VARCHAR(191) NULL,
    `paqueteDeVueloId` INTEGER NOT NULL,
    `formaPagoId` INTEGER NOT NULL,
    `estadoPagoId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reserva` ADD CONSTRAINT `Reserva_paqueteDeVueloId_fkey` FOREIGN KEY (`paqueteDeVueloId`) REFERENCES `PaqueteDeVuelo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reserva` ADD CONSTRAINT `Reserva_formaPagoId_fkey` FOREIGN KEY (`formaPagoId`) REFERENCES `FormasPago`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reserva` ADD CONSTRAINT `Reserva_estadoPagoId_fkey` FOREIGN KEY (`estadoPagoId`) REFERENCES `estado_pago`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
