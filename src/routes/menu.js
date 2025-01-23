const express = require("express");
const router = express.Router();
const ctrl_menu = require("../controllers/ctrl_menu");

router.get("/menu", ctrl_menu.menu);

// router.get("/menu", ctrl_menu.menu);

module.exports = router;
