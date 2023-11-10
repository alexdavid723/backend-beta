import express from 'express';
import {
    createReserva,
    getReservas,
    getReservaById,
    deleteReserva,
    updateReserva
} from '../controllers/reservaController.js'; // Asegúrate de importar el controlador adecuado

const router = express.Router();

router.post('/reservas', createReserva); // Ruta para crear una reserva
router.get('/reservas', getReservas);
router.get('/reservas/:id', getReservaById);
router.delete('/reservas/:id', deleteReserva);
router.put('/reservas/:id', updateReserva)
export default router;
