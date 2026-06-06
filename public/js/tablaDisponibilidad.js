// Using JavaScript class constructor
new DataTable("#tablaDisponibilidad", {
  scrollY: window.innerWidth < 768 ? false : 300,
  paging: true,
  lengthMenu: [10, 25, 50],
  pageLength: 10,
  responsive: "true",
  // dom: "Bfrtip",
  // dom: "Bifrtp",
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
});
