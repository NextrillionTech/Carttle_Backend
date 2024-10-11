import {Router} from "express";

import { getMessages } from "../controllers/messagesController";

const messagesRoutes = Router();

messagesRoutes.post("/get-messages",getMessages);

export default messagesRoutes;