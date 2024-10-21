const { Router } = require("express");
const { getMessages } = require("../controllers/messagesController");

const messagesRoutes = Router();

messagesRoutes.post("/get-messages", getMessages);

module.exports = messagesRoutes;
