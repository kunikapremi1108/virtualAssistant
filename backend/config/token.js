import jwt from 'jsonwebtoken'

const genToken = async (userId) => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not set in environment variables")
        }
        const token = await jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "10d" })
        return token
    } catch (error) {
        console.error("JWT generation error:", error.message)
        throw error
    }
}

export default genToken

