import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Base de datos
const db = await mysql.createPool({
  host: "localhost",
  user: "admin",
  password: "admin",
  database: "muebles",
});

// Ejemplo para saber si funciona la bd 
/* 
try {
  const [rows] = await db.query("SHOW TABLES");
  console.log(rows);
} catch (err) {
  console.error(" Error de conexión:", err);
}
*/

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "Pag.html"));
});

// Registro
app.post("/api/registro", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
        "INSERT INTO Cliente (Usuario, Nombre, Apellido, Telefono, email, `Contraseña`) VALUES (?, ?, ?, ?, ?, ?)",
        [email, '', "", "", email, hash]
    );

    res.json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el registro" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM cliente WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const valid = await bcrypt.compare(password, rows[0].Contraseña);
    if (!valid) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.json({ message: "Login exitoso", userId: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el login" });
  }
});

app.listen(4000, () => {
  console.log("Servidor corriendo en http://localhost:4000");
});
