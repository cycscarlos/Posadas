// Barra Activa. Barra debajo de cadaelemento del menu de navegación, y ella se irá desplazando a medida que se navega hasta el próximo elemento activo.

const opcionesMenu = document.querySelectorAll(".opcion-menu");
const barraActiva = document.querySelector(".barra-activa");

function ajustarBarraActiva(opcion) {
  const posicion = opcion.offsetLeft;
  const ancho = opcion.offsetWidth;
  barraActiva.style.width = `${ancho}px`;
  barraActiva.style.transform = `translateX(${posicion}px)`;
}

// Ajustar posición inicial de la barra activa
setTimeout(() => {
  const opcionActiva = document.querySelector(".opcion-menu.active");
  ajustarBarraActiva(opcionActiva);
}, 100);

opcionesMenu.forEach((opcion) => {
  opcion.addEventListener("click", () => {
    ajustarBarraActiva(opcion);
  });

  if (opcion.classList.contains("active")) {
    ajustarBarraActiva(opcion);
  }
});
