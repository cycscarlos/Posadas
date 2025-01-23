// Validacón de un formulario a través de Javascript

function validarFormulario() {
  var nombre = document.getElementById("nombre").value;
  var apellido = document.getElementById("apellido").value;
  var cedula = document.getElementById("cedula").value;
  var correo = document.getElementById("correo").value;
  var telefono = document.getElementById("telefono").value;
  var procedencia = document.getElementById("procedencia").value;
  var procedencia = document.getElementById("personas").value;
  var procedencia = document.getElementById("habitacion").value;
    var fechaEntrada = document.getElementById("fechaEntrada").value;
    var fechaSalida = document.getElementById("fechaSalida").value;

  var regexNombre = /^[A-Za-z]{1,15}$/;
  var regexNumerico = /^[0-9]{1,10}$/;
  var regexAlfanumerico = /^[A-Za-z0-9]{1,30}$/;
  var regexFecha = /^(\d{2})\/(\d{2})\/(\d{4})$/;

  if (
    !regexNombre.test(nombre) ||
    !regexNombre.test(apellido) ||
    !regexNumerico.test(cedula) ||
    !regexAlfanumerico.test(correo) ||
    !regexNumerico.test(telefono) ||
    !regexNombre.test(procedencia) ||
    !regexFecha.test(fechaEntrada) ||
    !regexFecha.test(fechaSalida) ||
    !regexNumerico.test(personas) ||
    !regexNumerico.test(habitacion)
  ) {
    console.log(
      nombre,
      apellido,
      cedula,
      correo,
      telefono,
      procedencia,
      personas,
      hbitacion,
      fechaEntrada,
      fechaSalida
    );
    alert("Por favor completa correctamente todos los campos del formulario.");
    return false;
  }

  return true;
}
