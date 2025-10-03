// Función para verificar si el usuario está autenticado
async function verificarAutenticacion() {
  try {
    const res = await fetch('http://localhost:4000/api/verificar-sesion', {
      method: 'GET',
      credentials: 'include' // Importante para enviar cookies
    });

    if (res.ok) {
      const data = await res.json();
      return data.usuario; // {id: 123, email: "user@email.com"}
    } else {
      return null; // No autenticado
    }
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    return null;
  }
}


async function protegerPagina() {
  const usuario = await verificarAutenticacion();
  
  if (!usuario) {
    // Redirigir al login si no está autenticado
    alert("Debes iniciar sesión para acceder a esta página");
    window.location.href = 'Pag.html';
    return null;
  }
  
  return usuario;
}

// Función para mostrar datos del usuario en la página
function mostrarDatosUsuario(usuario) {
  // Actualizar elementos del DOM con datos del usuario
  const elementos = {
    'user-email': usuario.email,
    'user-id': usuario.id,
    'welcome-message': `Bienvenido, ${usuario.email}`
  };

  Object.keys(elementos).forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.textContent = elementos[id];
    }
  });
}

// Función para hacer logout
async function logout() {
  try {
    const res = await fetch('http://localhost:4000/api/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (res.ok) {
      alert("Sesión cerrada exitosamente");
      window.location.href = 'Pag.html';
    } else {
      alert("Error al cerrar sesión");
    }
  } catch (error) {
    console.error('Error en logout:', error);
    alert("Error de conexion");
  }
}