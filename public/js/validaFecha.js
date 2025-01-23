document.getElementById("fechaSalida").addEventListener("change", function () {
  const fechaEntrada = new Date(document.getElementById("fechaEntrada").value);
  const fechaSalida = new Date(this.value);

  if (fechaSalida < fechaEntrada) {
    alert("La fecha de salida no puede ser anterior a la fecha de entrada.");
    this.value = ""; // Limpia el campo de salida
  }
});
