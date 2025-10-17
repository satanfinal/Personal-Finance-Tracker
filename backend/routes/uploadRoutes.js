import express from "express"
import multer from "multer"
import cloudinary from "../config/cloudinary.js"
import authMiddleware from "../middleware/authMiddleware.js"
import streamifier from "streamifier"

const router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" })
    const stream = cloudinary.uploader.upload_stream({ folder: "receipts" }, (err, result) => {
      if (err) return res.status(500).json({ msg: "Upload failed" })
      res.json({ url: result.secure_url })
    })
    streamifier.createReadStream(req.file.buffer).pipe(stream)
  } catch (err) {
    res.status(500).json({ msg: "Server error" })
  }
})

export default router
