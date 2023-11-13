import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';
import serviceAccount from '../functions/admin.json' assert { type: 'json' };
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'parapentes-database.appspot.com'
});

// Función para subir una imagen al almacenamiento

const bucket = admin.storage().bucket();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('imagenComprobante', 5); // Puedes ajustar el límite de imágenes aquí

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
                estadoPago: true,
                imagenesReserva: true
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
            console.log('Error de Multer:', err);
            return res.status(400).json({ error: 'Error al subir las imágenes.' });
        } else if (err) {
            console.error('Error en el servidor al subir las imágenes:', err);
            return res.status(500).json({ error: 'Error en el servidor al subir las imágenes.' });
        }

        const { fechaInicio, nombreCliente, telefonoCliente, correoCliente, paqueteDeVueloId, formaPagoId, estadoPagoId } = req.body;

        const files = req.files;

        if (!files || files.length === 0) {
            console.log('No se han subido imágenes.');
            return res.status(400).json({ error: 'No se han subido imágenes.' });
        }

        try {
            // Procesar cada archivo
            const imagenesUrls = [];
            for (const file of files) {
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
                        const cantidadPasajeros = parseInt(req.body.cantidadPasajeros);
                        await fileUpload.makePublic();
                        const imageUrl = `https://storage.googleapis.com/parapentes-database.appspot.com/${uniqueFilename}`;
                        imagenesUrls.push(imageUrl);

                        // Si has procesado todas las imágenes, crea la reserva
                        if (imagenesUrls.length === files.length) {
                            const nuevaReserva = await prisma.reserva.create({
                                data: {
                                    fechaInicio,
                                    nombreCliente,
                                    cantidadPasajeros,
                                    telefonoCliente,
                                    correoCliente,
                                    imagenesReserva: {
                                        create: imagenesUrls.map(imagenUrl => ({ imagenUrl }))
                                    },
                                    paqueteDeVueloId: parseInt(paqueteDeVueloId),
                                    formaPagoId: parseInt(formaPagoId),
                                    estadoPagoId: parseInt(estadoPagoId)
                                    // Otros campos de la reserva
                                }
                            });

                            console.log('Nueva reserva creada:', nuevaReserva);
                            res.status(201).json(nuevaReserva);
                        }
                    } catch (error) {
                        console.error('Error al crear la reserva en la base de datos:', error);
                        res.status(500).json({ error: 'No se pudo crear la reserva en la base de datos.' });
                    }
                });

                stream.end(file.buffer);
            }
        } catch (error) {
            console.error('Error al subir las imágenes:', error);
            res.status(500).json({ error: 'No se pudieron subir las imágenes.' });
        }
    });
};



// Resto del código...
export const deleteReserva = async (req, res) => {
    const reservaId = req.params.id; // Suponiendo que el ID de la reserva está en los parámetros de la solicitud

    try {
        const reserva = await prisma.reserva.findUnique({
            where: {
                id: parseInt(reservaId),
            },
            include: {
                imagenesReserva: true,
            },
        });

        if (!reserva) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        // Eliminar las imágenes asociadas a la reserva
        await Promise.all(reserva.imagenesReserva.map(async (imagen) => {
            const filename = imagen.imagenUrl.split('/').pop(); // Extraer el nombre del archivo de la URL
            const bucket = admin.storage().bucket(); // Obtiene la referencia al bucket de Firebase

            await bucket.file(filename).delete(); // Elimina el archivo del bucket

            // Elimina la imagen de la base de datos
            await prisma.imagenReserva.delete({
                where: {
                    id: imagen.id,
                },
            });
        }));

        // Eliminar la reserva
        const deletedReserva = await prisma.reserva.delete({
            where: {
                id: parseInt(reservaId),
            },
        });

        res.status(200).json({ message: 'Reserva y archivos de imágenes eliminados correctamente', deletedReserva });
    } catch (error) {
        console.error('Error al eliminar la reserva:', error);
        res.status(500).json({ error: 'No se pudo eliminar la reserva.' });
    }
};

export const updateReserva = async (req, res) => {
    const { id } = req.params;
    const { fechaInicio, nombreCliente, cantidadPasajeros, telefonoCliente, correoCliente, paqueteDeVueloId, formaPagoId, estadoPagoId } = req.body;
    
    try {
      const reserva = await prisma.reserva.findUnique({
        where: { id: parseInt(id) }
      });
  
      if (!reserva) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }
  
      // Verificar si se proporcionan nuevos IDs para paqueteDeVuelo, formaPago y estadoPago
      const dataToUpdate = {
        fechaInicio,
        nombreCliente,
        cantidadPasajeros,
        telefonoCliente,
        correoCliente,
        paqueteDeVueloId: paqueteDeVueloId ? parseInt(paqueteDeVueloId) : reserva.paqueteDeVueloId,
        formaPagoId: formaPagoId ? parseInt(formaPagoId) : reserva.formaPagoId,
        estadoPagoId: estadoPagoId ? parseInt(estadoPagoId) : reserva.estadoPagoId,
      };
  
      const reservaActualizado = await prisma.reserva.update({
        where: { id: parseInt(id) },
        data: dataToUpdate
      });
  
      res.json(reservaActualizado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar la reserva.' });
    }
  };