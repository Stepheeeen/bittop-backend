import User from "../models/User.js"
import bcrypt from "bcrypt"

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password")
  res.json(user)
}

export const updatePhone = async (req, res) => {
  const { phone } = req.body
  const user = await User.findById(req.user.id)

  user.phone = phone
  await user.save()

  res.json({ message: "Phone updated successfully" })
}

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const user = await User.findById(req.user.id)

  // check last password change
  const last = user.lastPasswordChange ? new Date(user.lastPasswordChange) : null
  const now = new Date()

  if (last) {
    const diff = (now - last) / (1000 * 60 * 60 * 24) // days
    if (diff < 30) {
      return res.status(400).json({
        error: `Password can only be changed every 30 days. ${Math.ceil(30 - diff)} days left.`
      })
    }
  }

  // verify old password
  const valid = await bcrypt.compare(oldPassword, user.password)
  if (!valid) return res.status(400).json({ error: "Old password incorrect" })

  // hash new password
  const hashed = await bcrypt.hash(newPassword, 10)
  user.password = hashed
  user.lastPasswordChange = now

  await user.save()

  res.json({ message: "Password updated successfully" })
}
