import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import genToken from "../config/token.js"
import { memoryDb } from "../config/memoryDb.js"
export const signUp = async(req,res)=>{
try{
    const{name,email,password}=req.body

    if(!name || !email || !password){
        return res.status(400).json({message:"All fields are required"})
    }

    if(password.length<6){
        return res.status(400).json({message:"Password must be at least 6 characters"})
    }

    // Try MongoDB first, fallback to memory
    let user, existEmail
    try {
        existEmail = await User.findOne({email})
        if(existEmail){
            return res.status(400).json({message:"Email already exists"})
        }
        const hashedPassword = await bcrypt.hash(password,10)
        user = await User.create({
            name,password:hashedPassword,email
        })
    } catch (dbError) {
        console.log("MongoDB not available, using memory database")
        existEmail = memoryDb.findUserByEmail(email)
        if(existEmail){
            return res.status(400).json({message:"Email already exists"})
        }
        const hashedPassword = await bcrypt.hash(password,10)
        user = memoryDb.createUser({
            name,password:hashedPassword,email
        })
    }

    const token = await genToken(user._id)
    res.cookie("token",token ,{
        httpOnly:true,
        maxAge:10*24*60*60*1000,
        sameSite:"strict",
        secure:false
    })

    return res.status(201).json(user)
    

}catch(error){
    if (error?.code === 11000) { // duplicate key (e.g., email)
        return res.status(400).json({message:"Email already exists"})
    }
    return res.status(500).json({message: error?.message || "Sign up error"})

}
}

export const Login = async(req,res)=>{
try{
    const{email,password}=req.body

    // Try MongoDB first, fallback to memory
    let user
    try {
        user = await User.findOne({email})
    } catch (dbError) {
        console.log("MongoDB not available, using memory database")
        user = memoryDb.findUserByEmail(email)
    }
    
    if(!user){
        return res.status(400).json({message:"Email does not exist"})
    }

    const isMatch= await bcrypt.compare(password,user.password)
    if(!isMatch){
        return res.status(400).json({message:"incorrect password"})
    }

    const token = await genToken(user._id)
    res.cookie("token",token ,{
        httpOnly:true,
        maxAge:10*24*60*60*1000,
        sameSite:"strict",
        secure:false
    })

    return res.status(200).json(user)
    

}catch(error){
    return res.status(500).json({message:` login error ${error}`})

}
}

export const logout = async(req,res)=>{
    try{
        res.clearCookie("token")
        return res.status(200).json({message:"logout successfully"})
    }catch(error){
        return res.status(500).json({message:` logout error ${error}`})
    }
}

// Return the currently authenticated user's data
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        const user = await User.findById(userId).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: error?.message || "Get current user error" })
    }
}