
import express from "express";
import bcrypt from "bcrypt";
import db from "./base_datos.js";

const router = express.Router();

// Registro
router.post("/registro", async (req, res) => {
  const { Usuario, Nombre, Apellido, Telefono, email, password } = req.body;

  try {
    const [usuarios] = await db.query(
      "SELECT * FROM Cliente WHERE email = ? OR Usuario = ?",
      [email, Usuario]
    );
    if (usuarios.length > 0) {

      const emailEnUso = usuarios.some(u => u.email === email);
      const usuarioEnUso = usuarios.some(u => u.Usuario === Usuario);

      let mensaje = "Ya existe ";
      if (emailEnUso && usuarioEnUso) mensaje += "un usuario y un email registrados.";
      else if (emailEnUso) mensaje += "un email registrado.";
      else mensaje += "un usuario registrado.";

      return res.status(400).json({ error: mensaje });
    }
    
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO Cliente (Usuario, Nombre, Apellido, Telefono, email, `Contraseña`) VALUES (?, ?, ?, ?, ?, ?)",
      [Usuario, Nombre, Apellido, Telefono, email, hash]
    );

    

    res.json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    console.log(err)
    console.error(err);
    res.status(500).json({ error: "Error en el registro" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM Cliente WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const usuario = rows[0];
    const match = await bcrypt.compare(password, usuario.Contraseña);

    if (!match) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    res.json({
      message: "Login exitoso",
      usuario: { id: usuario.cliente_id, email: usuario.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el login" });
  }
});

export default router;
