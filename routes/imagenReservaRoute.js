import express from "express";

import {
    getImagenesReserva,
    getImagenReservaById,
    createImagenReserva,
    updateImagenReserva,
    deleteImagenReserva
} from "../controllers/imagenReservaController.js";

const router = express.Router();

router.get('/imagenreserva', getImagenesReserva);
router.get('/imagenreserva/:id', getImagenReservaById);
router.post('/imagenreserva', createImagenReserva);
router.put('/imagenreserva/:id', updateImagenReserva);
router.delete('/imagenreserva/:id', deleteImagenReserva);

export default router;