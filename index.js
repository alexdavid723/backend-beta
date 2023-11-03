import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import FileUpload from "express-fileupload";
import PaqueteRoute from "./routes/PaqueteRoute.js"
import FormaPagoRoute from "./routes/FormaPagoRoute.js"
dotenv.config ();

const app = express();

app.use(cors());
app.use(express.json());
app.use(PaqueteRoute);
app.use(FormaPagoRoute);
//hacer visible imagenes dentro de la carptea
app.use(express.static("carpetaImagenes"));
app.use(FileUpload());

app.listen(process.env.APP_PORT, () => {
    console.log('Server corriendo...')
});