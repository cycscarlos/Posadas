const express = require("express");
const router = express.Router();
const ctrl_preReservaciones = require("../controllers/ctrl_preReservaciones");
const authorize = require("../middlewares/authorize");

router.get("/", ctrl_preReservaciones.getAllPreReservaciones);
router.post("/", authorize(["admin"]), ctrl_preReservaciones.createPreReservacion);
router.put("/:id", authorize(["admin"]), ctrl_preReservaciones.updatePreReservacion);
router.delete("/:id", authorize(["admin"]), ctrl_preReservaciones.deletePreReservacion);

module.exports = router;
