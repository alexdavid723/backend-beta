import express from "express";
import {
    getFormapago,
    getFormapagoById,
    createFormapago,
    updateFormapago,
    deleteFormapago
} from "../controllers/formaPagoController.js"

const router = express.Router();

router.get ('/Formapago', getFormapago);
router.get ('/Formapago/:id', getFormapagoById);
router.post ('/Formapago', createFormapago);
router.put ('/Formapago/:id', updateFormapago);
router.delete ('/Formapago/:id', deleteFormapago);

export default router;