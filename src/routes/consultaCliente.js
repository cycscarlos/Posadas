const express = require('express');
const router = express.Router();
const ctrl_consultaCliente = require('../controllers/ctrl_consultaCliente');

// Ruta para mostrar la vista principal
router.get('/consulta-cliente', (req, res) => {
  res.render('consulta-cliente'); 
});

// Ruta para procesar la consulta del cliente
router.post('/consulta-cliente', ctrl_consultaCliente.consultaCliente);

module.exports = router;
