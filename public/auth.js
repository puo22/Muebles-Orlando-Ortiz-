document.addEventListener("DOMContentLoaded", () => {
  const registroForm = document.getElementById("registro-form");

  if (registroForm) {
    registroForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // tomar los valores
      const email = document.getElementById("registro-email").value;
      const password = document.getElementById("registro-pass").value;

      try {
        const res = await fetch("/api/registro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
          alert("✅ " + data.message);
          registroForm.reset();
        } else {
          alert("❌ " + data.error);
        }
      } catch (err) {
        console.error("Error:", err);
        alert("⚠️ Error en la conexión con el servidor");
      }
    });
  }
});
