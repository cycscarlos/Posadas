const express = require("express");
const router = express.Router();
const ctrl_preReservaciones = require("../controllers/ctrl_preReservaciones");

router.get("/", ctrl_preReservaciones.getAllPreReservaciones);
router.post("/", ctrl_preReservaciones.createPreReservacion);
router.put("/:id", ctrl_preReservaciones.updatePreReservacion);
router.delete("/:id", ctrl_preReservaciones.deletePreReservacion);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const ctrl_preReservaciones = require("../controllers/ctrl_preReservaciones");

// router.get("/", ctrl_preReservaciones.renderPreReservacionView); // Renderizar la vista del formulario
// router.get("/list", ctrl_preReservaciones.getAllPreReservaciones); // Ruta para obtener todas las pre-reservaciones
// router.post("/", ctrl_preReservaciones.createPreReservacion);
// router.put("/:id", ctrl_preReservaciones.updatePreReservacion);
// router.delete("/:id", ctrl_preReservaciones.deletePreReservacion);

// module.exports = router;
