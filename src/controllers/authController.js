import User from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"

// Helper: send welcome email with robust handling
async function sendWelcomeEmail({ to, password }) {
    if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
        console.warn("Signup: EMAIL / EMAIL_PASS missing - skipping welcome email.");
        return { status: "skipped", reason: "missing_credentials" };
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        pool: true,
        maxConnections: 3,
        maxMessages: 30,
        connectionTimeout: 10000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
        auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS }
    });

    // Try verify (non-fatal)
    try { await transporter.verify(); } catch (vErr) {
        console.warn("SMTP verify failed (continuing):", vErr.code || vErr.message);
    }

    const html = `
        <div style="font-family: Arial, sans-serif; color: #222; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h2 style="color: #0066ff;">Welcome to <span style=\"color:#000;\">BITTOP</span>!</h2>
          <p>Hi there,</p>
          <p>We’re thrilled to have you onboard. Your BITTOP account has been successfully created and is ready to go. You can now start exploring the markets, make deposits, and grow your crypto portfolio with ease.</p>
          <div style="background: #fff; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #ddd;">
            <p><strong>Account Details:</strong></p>
            <p>Email: <b>${to}</b></p>
            <p>Password: <b>${password}</b></p>
            <p>Starting Balance: <b>$0.00</b></p>
          </div>
          <p>Next steps:</p>
          <ul>
            <li>🔒 Log in securely to your dashboard.</li>
            <li>💰 Fund your wallet to start trading or investing.</li>
            <li>📈 Track your portfolio in real time.</li>
          </ul>
          <p>If you didn’t request this account, please ignore this email or contact our support immediately.</p>
          <p style="margin-top: 20px;">Welcome to the future of digital finance.<br><b>The BITTOP Team</b></p>
        </div>`;

    try {
        const info = await transporter.sendMail({ to, subject: "🎉 Welcome to BITTOP — Your Crypto Journey Starts Here!", html });
        return { status: "sent", id: info.messageId };
    } catch (mailErr) {
        console.error("EMAIL SEND ERROR:", {
            code: mailErr.code,
            command: mailErr.command,
            response: mailErr.response,
            message: mailErr.message
        });
        return { status: "failed", code: mailErr.code, message: mailErr.message };
    }
}

export const signup = async (req, res) => {
    try {
        const { username, email } = req.body

        if (!username || !email) {
            return res.status(400).json({ error: "Missing fields" })
        }

        const exists = await User.findOne({ email })
        if (exists) return res.status(400).json({ error: "User exists" })

        const password = Math.random().toString(36).slice(-8)
        const hashed = await bcrypt.hash(password, 10)

        await User.create({
            username,
            email,
            password: hashed,
            lastPasswordChange: new Date()
        })


                // Send welcome email with robust handling
                const emailResult = await sendWelcomeEmail({ to: email, password });
                return res.json({
                        message: "Account created",
                        emailStatus: emailResult.status,
                        emailDetails: emailResult
                })

    } catch (err) {
        console.error("SIGNUP ERROR:", err)
        return res.status(500).json({
            error: err.message || "Internal server error",
            details: typeof err === "object" ? JSON.stringify(err) : err
        })
    }
}


export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ error: "Invalid credentials" })

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return res.status(400).json({ error: "Invalid credentials" })

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })

        return res.json({ token })
    } catch (err) {
        console.error("LOGIN ERROR:", err)
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}
