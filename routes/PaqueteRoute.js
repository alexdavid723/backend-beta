import express from 'express';
import multer from 'multer';
import path from 'path';
import {
    getPaquetes,
    getPaquetesById,
    createPaquetes,
    updatePaquetes,
    deletePaquetes
} from "../controllers/paqueteController.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'carpetaImagenespaquete'); // Ruta donde se guardarán las imágenes
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).single('imagen');

router.get('/paquetes', getPaquetes);
router.get('/paquetes/:id', getPaquetesById);
router.post('/paquetes', createPaquetes);

// Actualización de paquetes con manejo de archivos utilizando Multer
router.put('/paquetes/:id', upload, updatePaquetes);

router.delete('/paquetes/:id', deletePaquetes);

export default router;
