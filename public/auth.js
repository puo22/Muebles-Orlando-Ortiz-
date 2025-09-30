document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registerForm'); // <--- Asegúrate de esto

    if (registroForm) {
        registroForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const Usuario = document.getElementById('Usuario').value;
            const Nombre = document.getElementById('Nombre').value;
            const Apellido = document.getElementById('Apellido').value;
            const Telefono = document.getElementById('Telefono').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

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
});