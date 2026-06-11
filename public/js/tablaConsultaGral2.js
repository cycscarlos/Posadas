// Using JavaScript class constructor
new DataTable("#tablaConsultaGral", {
  scrollY: window.innerWidth < 768 ? false : 250,
  paging: true,
  lengthMenu: [5, 10, 25, 50],
  pageLength: 5,
  responsive: "true",
  // dom: "Bfrtip",
  dom: "Bifrtp",
  language: {
    lengthMenu: "Mostrar _MENU_ registros",
    zeroRecords: "No se encontraron resultados",
    info: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
    infoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
    infoFiltered: "(filtrado de un total de _MAX_ registros)",
    search: "Buscar:",
    paginate: {
      first: "Primero",
      last: "Ultimo",
      next: "Siguiente",
      previous: "Anterior",
    },
    processing: "procesando...",
  },
  buttons: [
    {
      extend: "excelHtml5",
      text: "<i class='fas fa-file-excel'></i>",
      titleAttr: "Exportar a Excel",
      className: "btn btn-success",
    },
    {
      extend: "pdfHtml5",
      text: "<i class='fas fa-file-pdf'></i>",
      titleAttr: "Exportar a PDF",
      className: "btn btn-danger",
      orientation: "landscape",
      pageSize: "LEGAL"
    },
    {
      extend: "print",
      text: "<i class='fa fa-print'></i>",
      titleAttr: "Imprimir",
      className: "btn btn-info",
      exportOptions: {
        columns: ":visible"
      },
      customize: function(win) {
        $(win.document.body).find('table').addClass('display').css('font-size', '9px').css('width', '100%');
        $(win.document.body).find('th, td').css('white-space', 'nowrap');
        var style = win.document.createElement('style');
        style.innerHTML = '@page { size: landscape; }';
        win.document.head.appendChild(style);
      }
    },
  ],
  // Definición de columnas
  columns: [
    { data: "id" },
    { data: "nombre" },
    { data: "apellido" },
    { data: "cedula" },
    { data: "correo" },
    { data: "telefono" },
    { data: "pocedencia" },
    { data: "personas" },
    { data: "habitacion" },
    { data: "entrada" },
    { data: "salida" },
    { data: "acciones" },
  ],
  columnDefs: [
    {
      // Columna 0: id (int)
      targets: 0,
      render: function (data, type, row) {
        return data; // devuelve el id
      },
    },
    {
      // Columna 1: nombre (varchar)
      targets: 1,
      render: function (data, type, row) {
        return data; // devuelve el nombre
      },
    },
    {
      // Columna 2: apellido (varchar)
      targets: 2,
      render: function (data, type, row) {
        return data; // devuelve el apellido
      },
    },
    {
      // Columna 3: cédula (int)
      targets: 3,
      render: function (data, type, row) {
        return data; // devuelve la cédula
      },
    },
    {
      // Columna 4: correo (varchar)
      targets: 4,
      render: function (data, type, row) {
        return data; // devuelve el correo
      },
    },
    {
      // Columna 5: teléfono (bigint)
      targets: 5,
      render: function (data, type, row) {
        return data.toString(); // se asegura de que sea tratado como un string
      },
    },
    {
      // Columna 6: procedencia (varchar)
      targets: 6,
      render: function (data, type, row) {
        return data; // devuelve la procedencia
      },
    },
    {
      // Columna 7: número de personas (int)
      targets: 7,
      width: "50px",
      render: function (data, type, row) {
        return data; // devuelve personas
      },
    },
    {
      // Columna 8: Número Habitación (int)
      targets: 8,
      width: "60px",
      render: function (data, type, row) {
        return data; // devuelve habitación
      },
    },
    {
      // Columna 9: fecha de entrada (date)
      targets: 9,
      render: function (data, type, row) {
        // console.log("Fecha de entrada:", data, "Tipo:", typeof data);
        // return new Date(data).toLocaleDateString("es-ES");
        return data;
      },
    },
    {
      // Columna 10: fecha de salida (date)
      targets: 10,
      render: function (data, type, row) {
        console.log("Fecha de salida:", data, "Tipo:", typeof data);
        // return new Date(data).toLocaleDateString("es-ES");
        return data;
      },
    },
  ],
});
