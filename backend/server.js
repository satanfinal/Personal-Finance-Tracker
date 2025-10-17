import express from "express"
import http from "http"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import transactionRoutes from "./routes/transactionRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"
import { Server as IOServer } from "socket.io"
import analyticsRoutes from "./routes/analyticsRoutes.js"

dotenv.config()
const app = express()
const server = http.createServer(app)
const io = new IOServer(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
})
io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      if (userId) socket.join(userId)
    })
    socket.on("leave", (userId) => socket.leave(userId))
})
app.set("io", io)
connectDB()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/api/auth", authRoutes)
app.use("/api/transactions", transactionRoutes)
app.use("/api/uploads", uploadRoutes)
app.use("/api/analytics", analyticsRoutes)
app.get("/", (req, res) => res.send("API running"))
const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
