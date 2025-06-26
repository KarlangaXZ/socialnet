const form = document.getElementById("auth-form");
const toggleBtn = document.getElementById("toggle-form");
const title = document.getElementById("form-title");
const toggleText = document.getElementById("toggle-text");
const message = document.getElementById("message");
const usernameField = document.getElementById("username");

let isLogin = true;

toggleBtn.addEventListener("click", () => {
  isLogin = !isLogin;
  if (isLogin) {
    title.textContent = "Iniciar Sesión";
    toggleText.textContent = "¿No tienes cuenta?";
    toggleBtn.textContent = "Registrarse";
    usernameField.classList.add("hidden");
  } else {
    title.textContent = "Registro";
    toggleText.textContent = "¿Ya tienes cuenta?";
    toggleBtn.textContent = "Iniciar sesión";
    usernameField.classList.remove("hidden");
  }
  message.textContent = "";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  const endpoint = isLogin ? "/api/login" : "/api/register";
  const payload = isLogin ? { email, password } : { email, password, username };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      message.textContent = data.msg || data.error;
    } else {
      localStorage.setItem("token", data.token || ""); // guardar JWT si es login
      message.textContent = isLogin ? "Bienvenido!" : "Usuario registrado correctamente!";
      setTimeout(() => {
        // Redirigir a dashboard
        window.location.href = "dashboard.html"; // lo haremos en el siguiente paso
      }, 1000);
    }
  } catch (err) {
    message.textContent = "Error al conectar con el servidor.";
  }
});
