const express = require("express");
const router = express.Router();
const ctrl_actualizar = require("../controllers/ctrl_actualizar");
const authorize = require("../middlewares/authorize");

router.post("/actualizar/:id", authorize(["admin"]), ctrl_actualizar.actualizar);

module.exports = router;
