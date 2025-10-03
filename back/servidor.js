
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./auth.js";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());  

app.use(express.static(path.join(__dirname, "../public")));

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "Pag.html"));
});

// Montar rutas para fecth
app.use("/api", authRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
