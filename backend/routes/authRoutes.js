import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { OAuth2Client } from "google-auth-library"
import bcrypt from "bcryptjs"

const router = express.Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const signToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" })

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!email || !password) return res.status(400).json({ msg: "Email and password required" })
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ msg: "User already exists" })
    const user = new User({ name, email, password })
    await user.save()
    const token = signToken(user._id)
    res.json({ token, user })
  } catch (err) {
    res.status(500).json({ msg: "Server error" })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ msg: "User not found" })
    const isMatch = await user.matchPassword(password)
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" })
    const token = signToken(user._id)
    res.json({ token, user })
  } catch (err) {
    res.status(500).json({ msg: "Server error" })
  }
})

router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body
    const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
    const payload = ticket.getPayload()
    const { sub, email, name, picture } = payload
    let user = await User.findOne({ email })
    if (!user) user = await User.create({ name, email, googleId: sub, avatar: picture })
    const token = signToken(user._id)
    res.json({ token, user })
  } catch (err) {
    res.status(500).json({ msg: "Google login failed" })
  }
})

export default router
