import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// routes
import authRoutes from "./routes/auth.js"
import walletRoutes from "./routes/wallet.js"
import marketRoutes from "./routes/market.js"
import portfolioRoutes from "./routes/portfolio.js"
import userRoutes from "./routes/user.js"

app.use("/auth", authRoutes)
app.use("/wallet", walletRoutes)
app.use("/market", marketRoutes)
app.use("/portfolio", portfolioRoutes)
app.use("/user", userRoutes)

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("DB Connected ✅")
        app.listen(PORT, () => console.log(`Server running on port ${PORT} ⚡`))
    })
    .catch(err => console.error("DB Connection Failed ❌", err));
