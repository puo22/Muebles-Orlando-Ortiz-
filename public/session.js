
async function verificarAutenticacion() {
  try {
    const res = await fetch('http://localhost:4000/api/verificar-sesion', {
      method: 'GET',
      credentials: 'include'
    });

    if (res.ok) {
      const data = await res.json();
      return data.usuario; 
    } else {
      return null; 
    }
  } catch (error) {
    console.error('Error verificando autenticacion:', error);
    return null;
  }
}


async function protegerPagina() {
  const usuario = await verificarAutenticacion();
  
  if (!usuario) {
    alert("Debes iniciar sesion para acceder a esta pagina");
    window.location.href = 'Pag.html';
    return null;
  }
  
  return usuario;
}

function mostrarDatosUsuario(usuario) {
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

async function logout() {
  try {
    const res = await fetch('http://localhost:4000/api/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (res.ok) {
      alert("Sesion cerrada exitosamente");
      window.location.href = 'Pag.html';
    } else {
      alert("Error al cerrar sesion");
    }
  } catch (error) {
    console.error('Error en logout:', error);
    alert("Error de conexion");
  }
}