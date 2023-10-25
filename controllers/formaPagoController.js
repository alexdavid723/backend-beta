import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getFormapago = async (req, res) => {
    try {
        const response = await prisma.formasPago.findMany();
        res.status(200).json(response);
    } catch {
        res.status(500).json({ msg: error.message });
    }

}
export const getFormapagoById = async (req, res) => {
    try {
        const response = await prisma.formasPago.findUnique({
            where: {
                id: Number(req.params.id)
            }
        });
        res.status(200).json(response);
    } catch {
        res.status(404).json({ msg: error.message });
    }

}
export const createFormapago = async (req, res) => {
    const { descripcion, imagen} = req.body;

    try {
        const paquet = await prisma.formasPago.create({
            data: {
                descripcion: descripcion,
                imagen: imagen
            }
        });
        res.status(201).json(paquet)
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
}
export const updateFormapago = async (req, res) => {
    const { descripcion, imagen } = req.body;

    try {
        const paquet = await prisma.formasPago.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                descripcion: descripcion,
                imagen: imagen
            }
        });
        res.status(200).json(paquet)
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }

}
export const deleteFormapago = async (req, res) => {
    try {
        const deletedPackage = await prisma.formasPago.delete({
            where: {
                id: Number(req.params.id)
            }
        });
        res.status(200).json({ message: `Forma de pago con descripcion: ${deletedPackage.descripcion} eliminado` });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
}
