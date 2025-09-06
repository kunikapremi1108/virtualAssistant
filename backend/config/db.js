import mongoose from "mongoose"

function buildMongoUri() {
    if (process.env.MONGODB_URL) return process.env.MONGODB_URL
    const user = process.env.MONGODB_USER
    const pass = process.env.MONGODB_PASS
    const host = process.env.MONGODB_HOST
    const db   = process.env.MONGODB_DB
    if (user && pass && host && db) {
        const encodedPass = encodeURIComponent(pass)
        return `mongodb+srv://${user}:${encodedPass}@${host}/${db}?retryWrites=true&w=majority`
    }
    return null
}

const connectDb = async () => {
    const primaryUri = buildMongoUri()
    
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
