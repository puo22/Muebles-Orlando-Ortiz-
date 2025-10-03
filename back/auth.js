
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import db from "./base_datos.js";
import { JWT_SECRET } from "./config.js";

const router = express.Router();

const manejarErrorBD = (error) => {
  console.error('Error de base de datos:', error);
  
  if (error.code === 'ECONNREFUSED') {
    return { 
      status: 503, 
      message: "No se puede conectar a la base de datos. Verifique que Docker esté corriendo." 
    };
  }
  
  if (error.code === 'ENOTFOUND') {
    return { 
      status: 503, 
      message: "Servidor de base de datos no encontrado." 
    };
  }
  
  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    return { 
      status: 503, 
      message: "Error de credenciales de base de datos." 
    };
  }
  
  if (error.code === 'ETIMEDOUT') {
    return { 
      status: 503, 
      message: "Timeout de conexión a la base de datos." 
    };
  }
  
  return { 
    status: 500, 
    message: "Error interno del servidor." 
  };
};
// Verificar el token
export const verificarToken = (req, res, next) => {
  const token = req.cookies.acces_token;
  
  if (!token) {
    return res.status(401).json({ error: "Acceso no autorizado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Acceso no autorizado" });
  }
};

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
    console.error(err);
    const errorInfo = manejarErrorBD(err);
    res.status(errorInfo.status).json({ error: errorInfo.message });
    // Si no se manejó el error, enviar un error genérico
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
    const acces_token=jwt.sign({id:usuario.cliente_id,email:usuario.email},JWT_SECRET,{
        expiresIn:'2h'
    });

    res.cookie('acces_token',acces_token,{
      httpOnly:true,
      secure:false,
      maxAge:2*60*60*1000
    })
    res.json({
      message: "Login exitoso",
      usuario: { id: usuario.cliente_id, email: usuario.email },
    });
  } catch (err) {
    console.error(err);
    const errorInfo = manejarErrorBD(err);
    res.status(errorInfo.status).json({ error: errorInfo.message });
    // Si no se manejó el error, enviar un error genérico 
    res.status(500).json({ error: "Error en el login" });
  }
});

router.get("/verificar-sesion", verificarToken, (req, res) => {
  res.json({ 
    valid: true, 
    usuario: req.usuario // Contiene {id, email} del JWT
  });
});

// Ruta para obtener datos del usuario (NUEVA)
router.get("/perfil", verificarToken, (req, res) => {
  res.json({
    message: "Acceso autorizado",
    usuario: req.usuario
  });
});

// CORREGIR la ruta protegido:
router.get("/protegido", verificarToken, (req, res) => {
  // req.usuario contiene {id, email}, no {user}
  res.json({
    message: "Acceso a página protegida",
    usuario: req.usuario // {id: 123, email: "user@email.com"}
  });
});
router.post("/logout", (req, res) => {
  res.clearCookie('acces_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  });
  
  res.json({ message: "Logout exitoso" });
});
export default router;
