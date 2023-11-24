import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';


const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'carpetaimagenesformapago'); // Ruta donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).single('imagen');

export const getFormapago = async (req, res) => {
  try {
    const formasPago = await prisma.formasPago.findMany();
    res.json(formasPago);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todas las formas de pago.' });
  }
};

export const createFormapago = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Error al subir la imagen.' });
    } else if (err) {
      console.error('Error en el servidor al subir la imagen:', err);
      return res.status(500).json({ error: 'Error en el servidor al subir la imagen.' });
    }

    const { nombre, descripcion, estado, numero, cci } = req.body;

    let imagen;
    if (req.file) {
      imagen = req.file.path;
    }

    try {
      const nuevaFormaPago = await prisma.formasPago.create({
        data: {
          nombre,
          descripcion,
          estado: estado === 'true',
          numero: parseInt(numero),
          cci,
          imagen, // Ruta donde se guardó la imagen
          urlImagen: `http://localhost:5000/${req.file.filename}`, // URL para acceder a la imagen
        }
      });
      res.status(201).json(nuevaFormaPago);
    } catch (error) {
      console.error('Error al crear la nueva forma de pago:', error);
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error('Error al eliminar la imagen:', err);
          }
        });
      }
      res.status(500).json({ error: 'No se pudo crear la nueva forma de pago.' });
    }
  });
};

export const getFormapagoById = async (req, res) => {
  const { id } = req.params;
  try {
    const formaPago = await prisma.formasPago.findUnique({
      where: { id: parseInt(id) }
    });

    if (!formaPago) {
      return res.status(404).json({ error: 'Forma de pago no encontrada' });
    }

    res.json(formaPago);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la forma de pago por su ID.' });
  }
};
export const updateFormapago = async (req, res) => {
  try {
    const { id } = req.params;
    const formaPago = await prisma.formasPago.findUnique({
      where: { id: parseInt(id) }
    });

    if (!formaPago) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error('Error al eliminar la imagen:', err);
          }
        });
      }
      return res.status(404).json({ error: 'Forma de pago no encontrada' });
    }

    let updateData = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      estado: req.body.estado === 'true',
      numero: parseInt(req.body.numero),
      cci: req.body.cci,
      // ... otros campos para actualizar
    };

    if (req.file) {
      const imagen = req.file.path;
      const urlImagen = `http://localhost:5000/${req.file.filename}`;

      if (formaPago.imagen) {
        fs.unlink(formaPago.imagen, (err) => {
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

    const formaPagoActualizada = await prisma.formasPago.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(formaPagoActualizada);
  } catch (error) {
    console.error('Error al actualizar la forma de pago:', error);
    res.status(500).json({ error: 'Error al actualizar la forma de pago.' });
  }
};



export const deleteFormapago = async (req, res) => {
  const { id } = req.params;

  try {
    const formaPago = await prisma.formasPago.findUnique({
      where: { id: parseInt(id) }
    });

    if (!formaPago) {
      return res.status(404).json({ error: 'Forma de pago no encontrada' });
    }

    // Verificar si hay reservas asociadas a la forma de pago
    const reservations = await prisma.reserva.findMany({
      where: { formaPagoId: parseInt(id) }
    });

    if (reservations.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar la forma de pago ya que tiene reservas asociadas.' });
    }

    // Ruta de la imagen asociada a la forma de pago
    const imagePath = formaPago.imagen;

    // Eliminar la imagen del sistema de archivos si existe
    try {
      if (imagePath) {
        await fs.unlink(imagePath);
      }
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
    }

    // Eliminar la forma de pago
    await prisma.formasPago.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Forma de pago eliminada correctamente', imagePath: imagePath || 'No hay imagen asociada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la forma de pago por su ID.' });
  }
};