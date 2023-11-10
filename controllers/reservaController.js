import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';
import serviceAccount from '../functions/admin.json' assert { type: 'json' };// Ruta a tu archivo de credenciales de Firebase
import multer from 'multer';// Suponiendo que tienes una función para actualizar la imagen en Firebase

const prisma = new PrismaClient();

import { v4 as uuidv4 } from 'uuid';

// Inicializar Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'parapentes-database.appspot.com' // Reemplazar con tu bucket en Firebase Storage
});

const bucket = admin.storage().bucket();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('imagenComprobante');



export const getReservas = async (req, res) => {
    try {
        const reservas = await prisma.reserva.findMany(); // Obtiene todas las reservas
        res.json(reservas);
    } catch (error) {
        console.error('Error al obtener las reservas:', error);
        res.status(500).json({ error: 'Error al obtener todas las reservas.' });
    }
};
export const getReservaById = async (req, res) => {
    const { id } = req.params;

    try {
        const reserva = await prisma.reserva.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                paqueteDeVuelo: true,
                formaPago: true,
                estadoPago: true
            }
        });

        if (!reserva) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        res.json(reserva);
    } catch (error) {
        console.error('Error detallado:', error); // Imprime el error detallado en la consola
        res.status(500).json({ error: 'Error al obtener la reserva' });
    }
};


export const createReserva = (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: 'Error al subir la imagen.' });
        } else if (err) {
            console.error('Error en el servidor al subir la imagen:', err);
            return res.status(500).json({ error: 'Error en el servidor al subir la imagen.' });
        }

        const { fechaInicio, nombreCliente, cantidadPasajeros, telefonoCliente, correoCliente, paqueteDeVueloId, formaPagoId, estadoPagoId } = req.body;

        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No se ha subido ninguna imagen.' });
        }

        try {
            const cantidadPasajeros = parseInt(req.body.cantidadPasajeros);
            const uniqueFilename = `${uuidv4()}_${file.originalname}`;
            const fileUpload = bucket.file(uniqueFilename);

            const stream = fileUpload.createWriteStream({
                metadata: {
                    contentType: file.mimetype
                }
            });

            stream.on('error', (err) => {
                console.error('Error al subir la imagen a Firebase Storage:', err);
                res.status(500).json({ error: 'Error al subir la imagen a Firebase Storage.' });
            });

            stream.on('finish', async () => {
                try {
                    await fileUpload.makePublic();
                    const imageUrl = `https://storage.googleapis.com/parapentes-database.appspot.com/${uniqueFilename}`;

                    const nuevaReserva = await prisma.reserva.create({
                        data: {
                            fechaInicio,
                            nombreCliente,
                            cantidadPasajeros,
                            telefonoCliente,
                            correoCliente,
                            imagenComprobante: imageUrl,
                            paqueteDeVueloId: parseInt(paqueteDeVueloId),
                            formaPagoId: parseInt(formaPagoId),
                            estadoPagoId: parseInt(estadoPagoId)
                            // Otros campos de la reserva
                        }
                    });

                    res.status(201).json(nuevaReserva);
                } catch (error) {
                    console.error('Error al crear la reserva en la base de datos:', error);
                    res.status(500).json({ error: 'No se pudo crear la reserva en la base de datos.' });
                }
            });

            stream.end(file.buffer);
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            res.status(500).json({ error: 'No se pudo subir la imagen.' });
        }
    });
};
export const deleteReserva = async (req, res) => {
    const reservaId = req.params.id; // Suponiendo que el ID de la reserva está en los parámetros de la solicitud

    try {
        const reserva = await prisma.reserva.findUnique({
            where: {
                id: parseInt(reservaId),
            },
        });

        if (!reserva) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        const { imagenComprobante } = reserva;
        const imageUrl = imagenComprobante; // URL de la imagen almacenada en Firebase

        // Eliminar la reserva
        const deletedReserva = await prisma.reserva.delete({
            where: {
                id: parseInt(reservaId),
            },
        });

        // Eliminar la imagen de Firebase Storage
        if (imageUrl) {
            const filename = imageUrl.split('/').pop(); // Extraer el nombre del archivo de la URL
            const bucket = admin.storage().bucket(); // Obtiene la referencia al bucket de Firebase

            await bucket.file(filename).delete(); // Elimina el archivo del bucket
        }

        res.status(200).json({ message: 'Reserva y archivo eliminados correctamente', deletedReserva });
    } catch (error) {
        console.error('Error al eliminar la reserva:', error);
        res.status(500).json({ error: 'No se pudo eliminar la reserva.' });
    }
};
export const updateReserva = async (req, res) => {
    const { id } = req.params;

    try {
        const reserva = await prisma.reserva.findUnique({
            where: { id: parseInt(id) }
        });

        if (!reserva) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        upload(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: 'Error al subir la imagen.' });
            } else if (err) {
                console.error('Error en el servidor al subir la imagen:', err);
                return res.status(500).json({ error: 'Error en el servidor al subir la imagen.' });
            }

            const file = req.file;

            if (!file) {
                return res.status(400).json({ error: 'No se ha subido ninguna imagen.' });
            }

            try {
                // Eliminar la imagen anterior
                if (reserva.imagenComprobante) {
                    const filename = reserva.imagenComprobante.split('/').pop();
                    const fileToDelete = bucket.file(filename);

                    // Eliminar el archivo del bucket
                    await fileToDelete.delete();
                }

                const uniqueFilename = `${uuidv4()}_${file.originalname}`;
                const fileUpload = bucket.file(uniqueFilename);
                const stream = fileUpload.createWriteStream({
                    metadata: {
                        contentType: file.mimetype
                    }
                });

                stream.on('error', (err) => {
                    console.error('Error al subir la imagen a Firebase Storage:', err);
                    res.status(500).json({ error: 'Error al subir la imagen a Firebase Storage.' });
                });

                stream.on('finish', async () => {
                    try {
                        await fileUpload.makePublic();
                        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFilename}`;

                        const reservaActualizada = await prisma.reserva.update({
                            where: { id: parseInt(id) },
                            data: {

                                fechaInicio: req.body.fechaInicio || reserva.fechaInicio,
                                nombreCliente: req.body.nombreCliente || reserva.nombreCliente,
                                cantidadPasajeros: req.body.cantidadPasajeros ? parseInt(req.body.cantidadPasajeros) : reserva.cantidadPasajeros,
                                telefonoCliente: req.body.telefonoCliente || reserva.telefonoCliente,
                                correoCliente: req.body.correoCliente || reserva.correoCliente,
                                imagenComprobante: imageUrl,
                                paqueteDeVueloId: req.body.paqueteDeVueloId ? parseInt(req.body.paqueteDeVueloId) : reserva.paqueteDeVueloId,
                                formaPagoId: req.body.formaPagoId ? parseInt(req.body.formaPagoId) : reserva.formaPagoId,
                                estadoPagoId: req.body.estadoPagoId ? parseInt(req.body.estadoPagoId) : reserva.estadoPagoId
                                // Otros campos de la reserva que se deseen actualizar
                            }
                        });

                        res.json(reservaActualizada);
                    } catch (error) {
                        console.error('Error al actualizar la reserva con la nueva imagen:', error);
                        res.status(500).json({ error: 'Error al actualizar la reserva con la nueva imagen.' });
                    }
                });

                stream.end(file.buffer);
            } catch (error) {
                console.error('Error al actualizar la reserva:', error);
                res.status(500).json({ error: 'Error al actualizar la reserva.' });
            }
        });
    } catch (error) {
        console.error('Error al encontrar la reserva:', error);
        res.status(500).json({ error: 'Error al encontrar la reserva.' });
    }
};