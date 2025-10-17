import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  googleId: { type: String, index: true, sparse: true },
  avatar: { type: String }
}, { timestamps: true })

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next()
  if (!this.password) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = async function(entered) {
  if (!this.password) return false
  return await bcrypt.compare(entered, this.password)
}

const User = mongoose.model("User", userSchema)
export default User
