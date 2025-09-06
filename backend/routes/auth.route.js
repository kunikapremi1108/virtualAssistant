import express from "express"
import {signUp,Login, logout} from "../controllers/auth.controller.js"

const authRouter=express.Router()


authRouter.post("/signup",signUp)
authRouter.post("/signin",Login)
authRouter.post("/logout",logout)



export default authRouter
