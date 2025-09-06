import express from 'express'
import dotenv from 'dotenv'
import userRouter from './routes/user.route.js'
import authRouter from './routes/auth.route.js'
import assistantRouter from './routes/assistant.route.js'
import connectDb from './config/db.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

dotenv.config()
const app = express()
const port = process.env.PORT || 8000

// Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}))

// Routes
// Map auth actions (signup/signin/logout) to /api/auth
app.use("/api/auth", userRouter)
// Map current-user route to /api/user
app.use("/api/user", authRouter)
// Map assistant chat route to /api/assistant
app.use("/api/assistant", assistantRouter)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Root route for quick sanity check
app.get('/', (req, res) => {
  res.status(200).send('VirtualAssistant API is running')
})

// ✅ Start server only after DB connection
const startServer = async () => {
  try {
    await connectDb()  // wait until DB is connected
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`)
    })
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)
    process.exit(1) // stop server if DB fails
  }
}

startServer()
