import User from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"

export const signup = async (req, res) => {
  try {
    const { email } = req.body
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ error: "User exists" })

    const password = Math.random().toString(36).slice(-8)
    const hashed = await bcrypt.hash(password, 10)

    const user = await User.create({
      email,
      password: hashed,
      lastPasswordChange: new Date()
    })

    // send email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS }
    })

    await transporter.sendMail({
      to: email,
      subject: "BITTOP Account Created",
      text: `Welcome to BITTOP.\n\nEmail: ${email}\nPassword: ${password}\nBalance: $0`
    })

    res.json({ message: "Account created & email sent" })
  } catch (err) {
    res.status(500).json({ error: err })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user) return res.status(400).json({ error: "Invalid credentials" })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(400).json({ error: "Invalid credentials" })

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

  res.json({ token })
}
