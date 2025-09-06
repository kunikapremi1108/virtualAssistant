import { GoogleGenerativeAI } from '@google/generative-ai'
import User from '../models/user.model.js'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key-here')

export const chatWithAssistant = async (req, res) => {
    try {
        const { message, userId } = req.body
        
        if (!message) {
            return res.status(400).json({ message: 'Message is required' })
        }

        // Get user data for context
        const user = await User.findById(userId).select('-password')
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // Initialize Gemini model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })

        // Create context with user's assistant name
        const context = `You are ${user.assistantName || 'Virtual Assistant'}, a helpful AI assistant. 
        The user is asking: "${message}". 
        Respond in a friendly, helpful manner as their personal assistant. 
        Keep responses concise but informative.`

        const result = await model.generateContent(context)
        const response = await result.response
        const text = response.text()

        // Save conversation to user's history
        await User.findByIdAndUpdate(userId, {
            $push: { history: `${new Date().toISOString()}: User: ${message} | Assistant: ${text}` }
        })

        res.status(200).json({ 
            response: text,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Gemini API Error:', error)
        res.status(500).json({ 
            message: 'Sorry, I encountered an error processing your request.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}
