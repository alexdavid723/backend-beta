import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getPaquetes = async (req, res) => {
    try {
        const response = await prisma.paqueteDeVuelo.findMany();
        res.status(200).json(response);
    } catch {
        res.status(500).json({ msg: error.message });
    }

}
export const getPaquetesById = async (req, res) => {
    try {
        const response = await prisma.paqueteDeVuelo.findUnique({
            where: {
                id: Number(req.params.id)
            }
        });
        res.status(200).json(response);
    } catch {
        res.status(404).json({ msg: error.message });
    }

}
export const createPaquetes = async (req, res) => {
    const { nombre_paquete, descripcion, imagen, duracion, precio } = req.body;

    try {
        const paquet = await prisma.paqueteDeVuelo.create({
            data: {
                nombre_paquete: nombre_paquete,
                descripcion: descripcion,
                imagen: imagen,
                duracion: duracion,
                precio: precio
            }
        });
        res.status(201).json(paquet)
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
}
export const updatePaquetes = async (req, res) => {
    const { nombre_paquete, descripcion, imagen, duracion, precio } = req.body;

    try {
        const paquet = await prisma.paqueteDeVuelo.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                nombre_paquete: nombre_paquete,
                descripcion: descripcion,
                imagen: imagen,
                duracion: duracion,
                precio: precio
            }
        });
        res.status(200).json(paquet)
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }

}
export const deletePaquetes = async (req, res) => {
    try {
        const deletedPackage = await prisma.paqueteDeVuelo.delete({
            where: {
                id: Number(req.params.id)
            }
        });
        res.status(200).json({ message: `Paquete de vuelo con ID ${deletedPackage.id} eliminado` });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
}
