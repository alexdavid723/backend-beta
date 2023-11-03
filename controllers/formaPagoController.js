import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';

const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'carpetaImagenesFormasPago'); // Ruta donde se guardarán las imágenes para formas de pago
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

export const createFormapago = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Error al subir la imagen.' });
    } else if (err) {
      return res.status(500).json({ error: 'Error en el servidor al subir la imagen.' });
    }

    const { descripcion} = req.body;
    const imagen = req.file.path;

    try {
      const nuevaFormaPago = await prisma.formasPago.create({
        data: {
          descripcion,
          imagen,
        }
      });
      res.status(201).json(nuevaFormaPago);
    } catch (error) {
      res.status(500).json({ error: 'No se pudo crear la nueva forma de pago.' });
    }
  });
};

export const updateFormapago = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Error al subir la imagen.' });
    } else if (err) {
      return res.status(500).json({ error: 'Error en el servidor al subir la imagen.' });
    }

    const { id } = req.params;
    const { descripcion } = req.body;
    const imagen = req.file.path;

    try {
      const formaPagoActualizada = await prisma.formasPago.update({
        where: { id: parseInt(id) },
        data: {
          descripcion,
          imagen,

        }
      });
      res.json(formaPagoActualizada);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la forma de pago.' });
    }
  });
};

export const deleteFormapago = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.formasPago.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Forma de pago eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la forma de pago por su ID.' });
  }
};
