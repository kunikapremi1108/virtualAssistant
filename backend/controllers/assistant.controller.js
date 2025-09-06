import { GoogleGenerativeAI } from '@google/generative-ai'
import User from '../models/user.model.js'

export const chatWithAssistant = async (req, res) => {
  try {
    const { message, userId } = req.body
    if (!message) return res.status(400).json({ message: 'Message is required' })

    const user = await User.findById(userId).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const context = `You are ${user.assistantName || 'Virtual Assistant'}, a helpful AI assistant.
    The user is asking: "${message}". Respond in a friendly, concise manner.`
    const text = await generateText(context);

    await User.findByIdAndUpdate(userId, {
      $push: { history: `${new Date().toISOString()}: User: ${message} | Assistant: ${text}` }
    })
    res.status(200).json({ response: text, timestamp: new Date().toISOString() })

  } catch (error) {
    console.error('Gemini API Error:', error)
    res.status(500).json({
      message: "Error processing your request. Make sure GEMINI_API_KEY is valid.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}


export async function generateText(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = process.env.GEMINI_API_URL

  try {
    const response = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  } catch (error) {
    console.error("Gemini API request failed:", error);
    throw error;
  }
}

