import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';


const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'carpetaImagenespaquete'); // Ruta donde se guardarán las imágenes
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
          //para guardar las imagenes se puede hacer que cambie la rut ahacia la ip del emulador
          //esto lo podemos cambiar a localhost:5000
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
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error('Error al eliminar la imagen:', err);
          }
        });
      }
      return res.status(404).json({ error: 'paquete no encontrado' });
    }

    let updateData = {
      nombre_paquete: req.body.nombre_paquete,
      descripcion: req.body.descripcion,
      duracion: parseInt(req.body.duracion),
      precio: parseFloat(req.body.precio),
      estado: req.body.estado === 'true',
      // ... otros campos para actualizar
    };

    if (req.file) {
      const imagen = req.file.path;
      const urlImagen = `http://localhost:5000/${req.file.filename}`;

      if (paquete.imagen) {
        fs.unlink(paquete.imagen, (err) => {
          if (err) {
            console.error('Error al eliminar la imagen anterior:', err);
          }
        });
      }

      updateData = {
        ...updateData,
        imagen,
        urlImagen
      };
    }

    const paqueteActualizado = await prisma.paqueteDeVuelo.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(paqueteActualizado);
  } catch (error) {
    console.error('Error al actualizar paquete:', error);
    res.status(500).json({ error: 'Error al actualizar paquete.' });
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

    // Verificar si hay reservas asociadas al paquete de vuelo
    const reservations = await prisma.reserva.findMany({
      where: { paqueteDeVueloId: parseInt(id) }
    });

    if (reservations.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar el paquete de vuelo ya que tiene reservas asociadas.' });
    }

    // Ruta de la imagen asociada al paquete de vuelo
    const imagePath = paquete.imagen;

    // Eliminar la imagen del sistema de archivos
    try {
      if (imagePath) {
        await fs.unlink(imagePath);
      }
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
    }

    // Eliminar el paquete de vuelo de la base de datos
    await prisma.paqueteDeVuelo.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Paquete de vuelo eliminado correctamente', imagePath: imagePath || 'No hay imagen asociada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el paquete de vuelo por su ID.' });
  }
};
