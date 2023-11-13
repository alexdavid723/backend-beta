
import express from 'express';
import {
    createReserva,
    getReservas,
    getReservaById,
    deleteReserva,
    updateReserva
} from '../controllers/reservaController.js';

const router = express.Router();

// Aplicar el middleware de autenticación solo a las rutas que lo necesitan
//router.use('/reservas', authMiddleware);

// Aplicar el middleware de autorización de roles solo a las rutas que lo necesitan
//router.use('/reservas', authRoleMiddleware(['admin', 'asesor']));

router.post('/reservas', createReserva); // Ruta para crear una reserva
router.get('/reservas', getReservas);
router.get('/reservas/:id', getReservaById);
router.delete('/reservas/:id', deleteReserva);
router.put('/reservas/:id', updateReserva);

export default router;
