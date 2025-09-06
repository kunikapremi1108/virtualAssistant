import express from "express"
import { getCurrentUser } from "../controllers/auth.controller.js"
import { updateAssistant } from "../controllers/user.controller.js"
import isAuth from "../middlewares/isAuth.js"
import upload from "../middlewares/multer.js"


const authRouter=express.Router()


authRouter.get("/current",isAuth,getCurrentUser)
authRouter.post("/update",isAuth,upload.single("assistantImage"),updateAssistant)



export default authRouter
