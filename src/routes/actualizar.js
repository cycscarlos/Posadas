const express = require("express");
const router = express.Router();
const ctrl_actualizar = require("../controllers/ctrl_actualizar");

router.post("/actualizar/:id", ctrl_actualizar.actualizar);

module.exports = router;
