import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'carpetaImagenes'); // Ruta donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).single('imagen');

export const getPaquetes = async (req, res) => {
  try {
    const paquetes = await prisma.paqueteDeVuelo.findMany();
    res.json(paquetes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los paquetes de vuelo.' });
  }
};

export const getPaquetesById = async (req, res) => {
  const { id } = req.params;
  try {
    const paquete = await prisma.paqueteDeVuelo.findUnique({
      where: { id: parseInt(id) }
    });

    if (!paquete) {
      return res.status(404).json({ error: 'Paquete de vuelo no encontrado' });
    }

    res.json(paquete);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el paquete de vuelo por su ID.' });
  }
};
export const createPaquetes = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Error al subir la imagen.' });
    } else if (err) {
      console.error('Error en el servidor al subir la imagen:', err);
      return res.status(500).json({ error: 'Error en el servidor al subir la imagen.' });
    }

    const { nombre_paquete, descripcion, duracion, precio, estado } = req.body;

    let imagen;
    if (req.file) {
      imagen = req.file.path;
    }

    try {
      const nuevoPaquete = await prisma.paqueteDeVuelo.create({
        data: {
          nombre_paquete,
          descripcion,
          imagen: imagen, // Guardar solo la ruta de la imagen
          urlImagen: `http://localhost:5000/${req.file.filename}`, // Generar la URL de la imagen si es accesible vía web
          duracion: parseInt(duracion),
          precio: parseFloat(precio),
          estado: estado === 'true'
        }
      });
      res.status(201).json(nuevoPaquete);
    } catch (error) {
      console.error('Error al crear el nuevo paquete de vuelo:', error);
      res.status(500).json({ error: 'No se pudo crear el nuevo paquete de vuelo.' });
    }
  });
};

export const updatePaquetes = async (req, res) => {
  try {
    const { id } = req.params;
    const paquete = await prisma.paqueteDeVuelo.findUnique({
      where: { id: parseInt(id) }
    });

    if (!paquete) {
      return res.status(404).json({ error: 'Paquete de vuelo no encontrado' });
    }

    let imagen = null;
    let urlImagen = null;
    if (req.file) {
      // Lógica para manejar una nueva imagen
      imagen = req.file.path;
      urlImagen = `http://localhost:5000/${req.file.filename}`;
    }

    const updateData = {
      nombre_paquete: req.body.nombre_paquete,
      descripcion: req.body.descripcion,
      imagen: imagen || paquete.imagen,
      // ... otros campos que desees actualizar
    };

    if (urlImagen) {
      updateData.urlImagen = urlImagen;
    }

    const paqueteActualizado = await prisma.paqueteDeVuelo.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(paqueteActualizado); // Respuesta de éxito
  } catch (error) {
    console.error('Error al actualizar el paquete de vuelo:', error);
    res.status(500).json({ error: 'Error al actualizar el paquete de vuelo.' });
  }
};


export const deletePaquetes = async (req, res) => {
  const { id } = req.params;
  try {
    const paquete = await prisma.paqueteDeVuelo.findUnique({
      where: { id: parseInt(id) }
    });

    if (!paquete) {
      return res.status(404).json({ error: 'Paquete de vuelo no encontrado' });
    }

    // Ruta de la imagen asociada al paquete
    const imagePath = paquete.imagen;

    // Eliminar la imagen del sistema de archivos
    if (imagePath) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error al eliminar la imagen:', err);
        }
      });
    }

    // Eliminar el paquete de vuelo de la base de datos
    await prisma.paqueteDeVuelo.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Paquete de vuelo y su imagen asociada eliminados correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el paquete de vuelo por su ID.' });
  }
};
