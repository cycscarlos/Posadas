const express = require("express");
const router = express.Router();
const ctrl_reservaciones = require("../controllers/ctrl_reservaciones");

router.get("/", ctrl_reservaciones.getAllReservaciones);
router.post("/", ctrl_reservaciones.createReservacion);
router.put("/:id", ctrl_reservaciones.updateReservacion);
router.delete("/:id", ctrl_reservaciones.deleteReservacion);

module.exports = router;
