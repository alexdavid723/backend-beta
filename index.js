
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import FileUpload from "express-fileupload";
import PaqueteRoute from "./routes/PaqueteRoute.js";
import FormaPagoRoute from "./routes/FormaPagoRoute.js";
import EstadoPagoRoute from "./routes/EstadoPagoRoute.js";
import ReservaRoute from "./routes/ReservaRoute.js";
import UserRoute from "./routes/imagenReservaRoute.js";

import moment from "moment-timezone"; // Importa moment-timezone

dotenv.config ();
moment.tz.setDefault('America/Lima');
const app = express();


app.use(cors());
app.use(express.json());
app.use(PaqueteRoute);
app.use(FormaPagoRoute);
app.use(EstadoPagoRoute);
app.use(ReservaRoute);
app.use(UserRoute);

//hacer visible imagenes dentro de la carptea
app.use(express.static("carpetaImagenespaquete"));
app.use(express.static("carpetaimagenesformapago"));
app.use(FileUpload());

app.listen(process.env.APP_PORT, () => {
    console.log('Server corriendo...')
});