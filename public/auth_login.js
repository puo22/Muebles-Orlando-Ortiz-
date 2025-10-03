document.addEventListener('DOMContentLoaded', () => {

    const loginForm=document.getElementById('loginForm');
    if (loginForm) {

        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

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
                

                if (res.ok) {
                    alert(data.message);
                    loginForm.reset();
                    window.location.href = 'protegido.html';
                }else{
                    alert("Error en la autenticacion");

                }
                    
    
            } catch (error) {

                console.error(error);
                alert("Error en la conexión con el servidor");
            }
        });
    }
});