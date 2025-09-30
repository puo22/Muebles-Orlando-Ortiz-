document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registerForm');
    const loginForm=document.getElementById('loginForm');

    if (registroForm) {
        registroForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const Usuario = document.getElementById('Usuario').value;
            const Nombre = document.getElementById('Nombre').value;
            const Apellido = document.getElementById('Apellido').value;
            const Telefono = document.getElementById('Telefono').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            if (!Usuario || !Nombre || !Apellido || !Telefono || !email || !password) {

              alert("Todos los campos son obligatorios");
              return;
            }
            if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
              alert("Correo electrónico no valido.");
              return;
            }
            if (password.length < 6) {
              alert("La contraseña debe tener al menos 6 caracteres");
              return;
            }
            if (!/^\d{10}$/.test(Telefono)) {
              alert("El telefono debe contener 10 numeros");
              return;
            }
            try {
                const res = await fetch("http://localhost:4000/api/registro", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ Usuario, Nombre, Apellido, Telefono, email, password })
                });

                const data = await res.json();
                alert(data.message || data.error);

                if (res.ok) registroForm.reset();
            } catch (error) {
                console.error(error);
                alert("Error en la conexión con el servidor");
            }
        });
    }
    if (loginForm) {
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            alert("Todos los campos son obligatorios");
            return;
        }
        if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            alert("Correo electronico no valido.");
            return;
        }

        try {
            const res = await fetch("http://localhost:4000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            alert(data.message || data.error);

            if (res.ok) {
                loginForm.reset();
                // Redirige o guarda datos según tu lógica
                // window.location.href = "Pag.html";
            }
        } catch (error) {

            console.error(error);
            alert("Error en la conexión con el servidor");
          }
      });
    }
});