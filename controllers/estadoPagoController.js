import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getEstadosPago = async (req, res) => {
  try {
    const estadosPago = await prisma.estado_pago.findMany();
    res.json(estadosPago);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los estados de pago.' });
  }
};

export const getEstadoPagoById = async (req, res) => {
  const { id } = req.params;
  try {
    const estadoPago = await prisma.estado_pago.findUnique({
      where: { id: parseInt(id) }
    });

    if (!estadoPago) {
      return res.status(404).json({ error: 'Estado de pago no encontrado' });
    }

    res.json(estadoPago);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el estado de pago por su ID.' });
  }
};

export const createEstadoPago = async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const nuevoEstadoPago = await prisma.estado_pago.create({
      data: {
        nombre,
        descripcion,
      }
    });
    res.status(201).json(nuevoEstadoPago);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear el nuevo estado de pago.' });
  }
};

export const updateEstadoPago = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  try {
    const estadoPago = await prisma.estado_pago.findUnique({
      where: { id: parseInt(id) }
    });

    if (!estadoPago) {
      return res.status(404).json({ error: 'Estado de pago no encontrado' });
    }

    const estadoPagoActualizado = await prisma.estado_pago.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        descripcion,
      }
    });

    res.json(estadoPagoActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el estado de pago.' });
  }
};

export const deleteEstadoPago = async (req, res) => {
  const { id } = req.params;
  try {
    const estadoPago = await prisma.estado_pago.findUnique({
      where: { id: parseInt(id) }
    });

    if (!estadoPago) {
      return res.status(404).json({ error: 'Estado de pago no encontrado' });
    }

    await prisma.estado_pago.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Estado de pago eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el estado de pago por su ID.' });
  }
};
