import uploadOnCloudinary from "../config/cloudinary.js"
import User from "../models/user.model.js"

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

export const getChatHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("name email history assistantName ");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};