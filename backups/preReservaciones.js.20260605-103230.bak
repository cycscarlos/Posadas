const express = require("express");
const router = express.Router();
const ctrl_preReservaciones = require("../controllers/ctrl_preReservaciones");

router.get("/", ctrl_preReservaciones.getAllPreReservaciones);
router.post("/", ctrl_preReservaciones.createPreReservacion);
router.put("/:id", ctrl_preReservaciones.updatePreReservacion);
router.delete("/:id", ctrl_preReservaciones.deletePreReservacion);

module.exports = router;
