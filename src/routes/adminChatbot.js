const router = require("express").Router();
const authorize = require("../middlewares/authorize");
const {
  getAdminChatbot,
  updatePrecio,
  addPromocion,
  deletePromocion,
} = require("../controllers/ctrl_adminChatbot");

router.get("/adminChatbot", authorize(["admin"]), getAdminChatbot);
router.post("/adminChatbot/precios/:id", authorize(["admin"]), updatePrecio);
router.post("/adminChatbot/promociones", authorize(["admin"]), addPromocion);
router.post("/adminChatbot/promociones/delete/:id", authorize(["admin"]), deletePromocion);

module.exports = router;
