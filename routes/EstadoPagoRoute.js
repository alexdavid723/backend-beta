import express from "express";

import {
    getEstadosPago,
    getEstadoPagoById,
    createEstadoPago,
    updateEstadoPago,
    deleteEstadoPago
} from "../controllers/estadoPagoController.js";

const router = express.Router();

router.get('/Estado', getEstadosPago);
router.get('/Estado/:id', getEstadoPagoById);
router.post('/Estado', createEstadoPago);
router.put('/Estado/:id', updateEstadoPago);
router.delete('/Estado/:id', deleteEstadoPago);

export default router;