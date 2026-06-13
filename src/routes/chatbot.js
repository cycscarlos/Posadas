const router = require("express").Router();
const { chatbotMessage } = require("../controllers/ctrl_chatbot");

router.post("/chatbot/message", chatbotMessage);

module.exports = router;
