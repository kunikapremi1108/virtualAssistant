import express from "express"
import { chatWithAssistant } from "../controllers/assistant/assistant.controller.js"
import isAuth from "../middlewares/isAuth.js"

const assistantRouter = express.Router()

assistantRouter.post("/chat", isAuth, chatWithAssistant)

export default assistantRouter
