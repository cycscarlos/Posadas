/**
 * Función para alternar la visibilidad de un campo de contraseña
 * @param {string} inputId - ID del campo de contraseña
 * @param {HTMLElement} icon - Elemento que contiene el ícono
 */
function togglePasswordVisibility(inputId, icon) {
  const passwordInput = document.getElementById(inputId);
  const iconElement = icon.querySelector("i");

  if (passwordInput.type === "password") {
    // Cambiar a texto visible
    passwordInput.type = "text";
    iconElement.classList.remove("fa-eye");
    iconElement.classList.add("fa-eye-slash");
  } else {
    // Cambiar a contraseña oculta
    passwordInput.type = "password";
    iconElement.classList.remove("fa-eye-slash");
    iconElement.classList.add("fa-eye");
  }
}
