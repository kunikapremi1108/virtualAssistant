import express from "express"
import {signUp,Login, logout} from "../controllers/auth.controller.js"


const userRouter=express.Router()


userRouter.post("/signup",signUp)
userRouter.post("/signin",Login)
userRouter.post("/logout",logout)



export default userRouter
