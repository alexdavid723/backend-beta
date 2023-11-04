import express from "express";
import multer from 'multer';
import path from 'path';

import {
    getFormapago,
    getFormapagoById,
    createFormapago,
    updateFormapago,
    deleteFormapago
} from "../controllers/formaPagoController.js";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'carpetaimagenesformapago'); // Ruta donde se guardarán las imágenes
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).single('imagen');

const router = express.Router();

router.get('/Formapago', getFormapago);
router.get('/Formapago/:id', getFormapagoById);
router.post('/Formapago', createFormapago);
router.put('/Formapago/:id', upload, updateFormapago);
router.delete('/Formapago/:id', deleteFormapago);

export default router;