import express from "express";
import {
    getPaquetes,
    getPaquetesById,
    createPaquetes,
    updatePaquetes,
    deletePaquetes
} from "../controllers/paqueteController.js"

const router = express.Router();

router.get ('/paquetes', getPaquetes);
router.get ('/paquetes/:id', getPaquetesById);
router.post ('/paquetes', createPaquetes);
router.put ('/paquetes/:id', updatePaquetes);
router.delete ('/paquetes/:id', deletePaquetes);

export default router;