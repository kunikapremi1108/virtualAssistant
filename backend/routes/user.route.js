import express from "express"
import { getCurrentUser } from "../controllers/auth.controller.js"
import { updateAssistant,getChatHistory } from "../controllers/user.controller.js"
import isAuth from "../middlewares/isAuth.js"
import upload from "../middlewares/multer.js"

const userRouter=express.Router()

userRouter.get("/current",isAuth,getCurrentUser)
userRouter.post("/update",isAuth,upload.single("assistantImage"),updateAssistant)
userRouter.get("/history", isAuth, getChatHistory);

export default userRouter
