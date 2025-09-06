import uploadOnCloudinary from "../config/cloudinary.js"
import User from "../models/user.model.js"

export const getCurrentUser=async(req,res)=>
{
    try{
        const userId=req.userId
        const user =await User.findById(userId).select("-password ")
        if(!user){
            return res.status(400).json({message:"user not found"})
        }
         return res.status(200).json(user)
    }catch(error){
         return res.status(400).json({message:"get current user error"})

    }
}
export const updateAssistant = async (req, res) => {
    try {
        const { assistantName, imageUrl } = req.body
        let assistantImage = imageUrl // Default to imageUrl
        
        if (req.file) {
            try {
                assistantImage = await uploadOnCloudinary(req.file.path)
            } catch (cloudinaryError) {
                console.error("Cloudinary error:", cloudinaryError)
                // If cloudinary fails, use the imageUrl as fallback
                assistantImage = imageUrl
            }
        }
        
        const user = await User.findByIdAndUpdate(req.userId, {
            assistantName, assistantImage
        }, { new: true }).select("-password")
        
        return res.status(200).json(user)
    } catch (error) {
        console.error("Update assistant error:", error)
        return res.status(400).json({ message: "update assistant error: " + error.message })
    }
}