import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

const prisma = new PrismaClient();

// Verifica si Firebase ya ha sido inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'parapentes-database.appspot.com'
  });
}

const deleteImageFromStorage = async (imageUrl) => {
  const filename = imageUrl.split('/').pop();
  await bucket.file(filename).delete();
};

const uploadImageToStorage = async (imagen) => {
  const filename = uuidv4() + '_' + imagen.originalname;
  const file = bucket.file(filename);

  const metadata = {
    contentType: imagen.mimetype,
  };

  await file.save(imagen.buffer, { metadata });
  await file.makePublic();

  const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
  return imageUrl;
};

const bucket = admin.storage().bucket();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('imagen', 5);

export const getImagenesReserva = async (req, res) => {
    try {
      const imagenesReserva = await prisma.imagenReserva.findMany();
  
      res.json(imagenesReserva);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener las imágenes de reserva.' });
    }
  };
export const getImagenReservaById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const imagenReserva = await prisma.imagenReserva.findUnique({
        where: { id: parseInt(id) },
      });
  
      if (!imagenReserva) {
        return res.status(404).json({ error: 'Imagen de reserva no encontrada.' });
      }
  
      res.json(imagenReserva);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener la imagen de reserva.' });
    }
  };
  

// Controlador para eliminar una imagen específica de una reserva
export const deleteImagenReserva = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Obtén la información de la imagen de la base de datos
      const imagenReserva = await prisma.imagenReserva.findUnique({
        where: { id: parseInt(id) },
      });
  
      // Verifica si la imagen existe
      if (!imagenReserva) {
        return res.status(404).json({ error: 'Imagen de reserva no encontrada' });
      }
  
      // Elimina la imagen del almacenamiento de Firebase
      await deleteImageFromStorage(imagenReserva.imagenUrl);
  
      // Elimina la imagen de la base de datos
      const deletedImagenReserva = await prisma.imagenReserva.delete({
        where: { id: parseInt(id) },
      });
  
      res.json(deletedImagenReserva);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar la imagen de reserva.' });
    }
  };
// Controlador para actualizar una imagen de reserva
export const updateImagenReserva = async (req, res) => {
    const { id } = req.params;

    try {
        // Obtén la información de la imagen anterior
        const imagenAnterior = await prisma.imagenReserva.findUnique({
            where: {
                id: parseInt(id),
            },
        });

        if (!imagenAnterior) {
            return res.status(404).json({ error: 'Imagen de reserva no encontrada' });
        }

        // Elimina la imagen anterior del almacenamiento
        await deleteImageFromStorage(imagenAnterior.imagenUrl);

        // Procesar la nueva imagen y agregarla al almacenamiento
        upload(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                console.log('Error de Multer:', err);
                return res.status(400).json({ error: 'Error al subir la nueva imagen.' });
            } else if (err) {
                console.error('Error en el servidor al subir la nueva imagen:', err);
                return res.status(500).json({ error: 'Error en el servidor al subir la nueva imagen.' });
            }

            const files = req.files;

            if (!files || files.length === 0) {
                console.log('No se ha subido una nueva imagen.');
                return res.status(400).json({ error: 'No se ha subido una nueva imagen.' });
            }

            try {
                // Procesar la nueva imagen y obtener la URL
                const uniqueFilename = `${uuidv4()}_${files[0].originalname}`;
                const fileUpload = bucket.file(uniqueFilename);

                const stream = fileUpload.createWriteStream({
                    metadata: {
                        contentType: files[0].mimetype,
                    },
                });

                stream.on('error', (err) => {
                    console.error('Error al subir la nueva imagen a Firebase Storage:', err);
                    res.status(500).json({ error: 'Error al subir la nueva imagen a Firebase Storage.' });
                });

                stream.on('finish', async () => {
                    try {
                        await fileUpload.makePublic();
                        const nuevaImagenUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFilename}`;

                        // Actualizar la información de la imagen en la base de datos
                        const imagenActualizada = await prisma.imagenReserva.update({
                            where: {
                                id: parseInt(id),
                            },
                            data: {
                                imagenUrl: nuevaImagenUrl,
                            },
                        });

                        res.json({ message: 'Imagen de reserva actualizada correctamente', imagenActualizada });
                    } catch (error) {
                        console.error('Error al procesar la nueva imagen:', error);
                        res.status(500).json({ error: 'No se pudo procesar la nueva imagen.' });
                    }
                });

                stream.end(files[0].buffer);
            } catch (error) {
                console.error('Error al subir la nueva imagen:', error);
                res.status(500).json({ error: 'No se pudo subir la nueva imagen.' });
            }
        });
    } catch (error) {
        console.error('Error al actualizar la imagen de reserva:', error);
        res.status(500).json({ error: 'No se pudo actualizar la imagen de reserva.' });
    }
};


  export const createImagenReserva = (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.log('Error de Multer:', err);
            return res.status(400).json({ error: 'Error al subir las imágenes.' });
        } else if (err) {
            console.error('Error en el servidor al subir las imágenes:', err);
            return res.status(500).json({ error: 'Error en el servidor al subir las imágenes.' });
        }

        const reservaId = parseInt(req.body.reservaId);
        const files = req.files;

        if (!reservaId || isNaN(reservaId)) {
            return res.status(400).json({ error: 'ID de reserva no válido.' });
        }

        if (!files || files.length === 0) {
            console.log('No se han subido imágenes.');
            return res.status(400).json({ error: 'No se han subido imágenes.' });
        }

        try {
            const imagenesUrls = await Promise.all(files.map(processImage));

            await prisma.imagenReserva.create({
                data: {
                    reservaId,
                    imagenUrl: imagenesUrls[0]  // Supongo que solo estás manejando una imagen por reserva
                }
            });

            res.status(201).json({ message: 'Imagen de reserva creada correctamente' });
        } catch (error) {
            console.error('Error al crear la imagen de reserva:', error);
            res.status(500).json({ error: 'No se pudo crear la imagen de reserva.' });
        }
    });
};

async function processImage(file) {
    return new Promise((resolve, reject) => {
        const uniqueFilename = `${uuidv4()}_${file.originalname}`;
        const fileUpload = bucket.file(uniqueFilename);
        const imageUrl = `https://storage.googleapis.com/parapentes-database.appspot.com/${uniqueFilename}`;

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        stream.on('error', (err) => {
            console.error('Error al subir la imagen a Firebase Storage:', err);
            reject(err);
        });

        stream.on('finish', async () => {
            await fileUpload.makePublic();
            resolve(imageUrl);
        });

        stream.end(file.buffer);
    });
}