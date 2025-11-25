import User from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const signup = async (req, res) => {
    try {
        const { username, email } = req.body;

        if (!username || !email) {
            return res.status(400).json({ error: "Missing fields" });
        }

        // Check existing user
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ error: "User exists" });
        }

        // Generate random password
        const password = Math.random().toString(36).slice(-8);
        const hashed = await bcrypt.hash(password, 10);

        // Create user
        await User.create({
            username,
            email,
            password: hashed,
            lastPasswordChange: new Date()
        });

        // Send email using Resend
        let emailResponse;

        try {
            emailResponse = await resend.emails.send({
                from: "BITTOP <onboarding@resend.dev>",
                to: email,
                subject: "Your BITTOP Account Details",
                html: `< div style="font-family: Arial, sans-serif; color: #222; background-color: #f9f9f9; padding: 20px; border-radius: 8px;" >
                <h2 style="color: #0066ff;">Welcome to <span style="color:#000;">BITTOP</span>!</h2>
                <p>Hi there,</p>
                <p>We’re thrilled to have you onboard. Your BITTOP account has been successfully created and is ready to go.</p>

                <div style="background: #fff; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #ddd;">
                <p><strong>Account Details:</strong></p>
                <p>Email: <b>${email}</b></p>
                <p>Password: <b>${password}</b></p>
                <p>Starting Balance: <b>$0.00</b></p>
                </div>

                <p>Next steps:</p>
                <ul>
                <li>🔒 Log in securely to your dashboard.</li>
                <li>💰 Fund your wallet to start trading or investing.</li>
                <li>📈 Track your portfolio in real time.</li>
                </ul>

                <p>If you didn’t request this account, please ignore this email or contact support immediately.</p>
                <p style="margin-top: 20px;">Welcome to the future of digital finance.<br><b>The BITTOP Team</b></p>
                </div > `
            });
        } catch (emailErr) {
            console.error("RESEND ERROR:", emailErr);
            emailResponse = { status: "failed", error: emailErr.message };
        }

        // Final response
        return res.json({
            message: "Account created",
            emailStatus: emailResponse?.status ?? "sent",
            emailDetails: emailResponse
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
