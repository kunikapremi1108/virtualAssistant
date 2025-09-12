import mongoose from "mongoose"

const connectDb = async () => {
    const primaryUri = process.env.MONGODB_URI ;
    
    // Try primary URI first if available
    if (primaryUri) {
        try {
            await mongoose.connect(primaryUri)
            console.log("DB connected")
            return
        } catch (error) {
            console.error("Mongo connection error:", error.message)
        }
    }
    
    // Always try local fallback for development
    const localUri = `mongodb://127.0.0.1:27017/${process.env.MONGODB_DB || 'virtualAssistant'}`
    try {
        await mongoose.connect(localUri)
        console.log("DB connected (local fallback)")
        return
    } catch (fallbackError) {
        console.error("Local Mongo fallback failed:", fallbackError.message)
        // For development, continue without database
        console.log("⚠️  Running without database - some features may not work")
    }
}

export default connectDb
