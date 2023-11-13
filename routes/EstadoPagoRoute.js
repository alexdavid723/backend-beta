import express from "express";

import {
    getEstadosPago,
    getEstadoPagoById,
    createEstadoPago,
    updateEstadoPago,
    deleteEstadoPago
} from "../controllers/estadoPagoController.js";

const router = express.Router();

router.get('/estado', getEstadosPago);
router.get('/estado/:id', getEstadoPagoById);
router.post('/estado', createEstadoPago);
router.put('/estado/:id', updateEstadoPago);
router.delete('/estado/:id', deleteEstadoPago);

export default router;