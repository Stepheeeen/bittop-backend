import User from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"

export const signup = async (req, res) => {
    try {
        const { username, email } = req.body;

        // Basic validation
        if (!email || !username) {
            return res.status(400).json({ error: "Missing fields" });
        }

        // Check user existence
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Generate and hash password
        const password = Math.random().toString(36).slice(-8);
        const hashed = await bcrypt.hash(password, 10);

        // Create user record
        const user = await User.create({
            username,
            email,
            password: hashed,
            lastPasswordChange: new Date(),
        });

        // Build email transport
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS
            }
        });

        // Send onboarding email
        const mailOptions = {
            to: email,
            subject: "BITTOP Account Created",
            html: `
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
            </div>`

        };

        let emailStatus = "success";
        try {
            await transporter.sendMail(mailOptions);
        } catch (emailErr) {
            console.error("EMAIL SEND ERROR:", emailErr);
            emailStatus = "failed";
        }

        return res.json({
            message: "Account created",
            emailStatus,
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            }
        });

    } catch (err) {
        console.error("SIGNUP ERROR:", err);

        return res.status(500).json({
            error: err.message || "Internal server error"
        });
    }
};


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
