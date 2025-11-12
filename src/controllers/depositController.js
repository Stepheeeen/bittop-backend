import User from "../models/User.js"
import Deposit from "../models/Deposit.js" // new model for pending deposits
import { getPrices } from "../services/prices.js"

// Initiate deposit (user submits)
export const initiateDeposit = async (req, res) => {
    try {
        const { coin, network, address, amount } = req.body

        if (!coin || !network || !address || !amount)
            return res.status(400).json({ message: "All fields are required." })

        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ message: "User not found" })

        const amountCrypto = parseFloat(amount)
        const price = await getPrice(coin)
        const amountUSD = price * amountCrypto

        // Add deposit as pending
        user.deposits = user.deposits || []
        user.deposits.push({
            coin,
            network,
            address,
            amountCrypto,
            amountUSD,
            status: "pending",
            date: new Date(),
        })

        await user.save()

        res.json({
            message: "Deposit submitted successfully. Await admin confirmation.",
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error." })
    }
}

// Admin approves deposit
export const approveDeposit = async (req, res) => {
    try {
        const { depositId } = req.params
        const deposit = await Deposit.findById(depositId)
        if (!deposit) return res.status(404).json({ message: "Deposit not found" })

        if (deposit.status !== "pending")
            return res.status(400).json({ message: "Deposit already processed" })

        const user = await User.findById(deposit.user)
        if (!user) return res.status(404).json({ message: "User not found" })

        const price = await getPrices(deposit.coin)
        const amountUSD = deposit.amount * price

        // Update user balance
        user.balance += amountUSD

        // Update portfolio
        const existing = user.portfolio.find((p) => p.coin === deposit.coin)
        if (existing) {
            existing.amount += deposit.amount
            existing.invested += amountUSD
            existing.history.push({ date: new Date(), amount: deposit.amount, invested: amountUSD })
        } else {
            user.portfolio.push({
                coin: deposit.coin,
                amount: deposit.amount,
                invested: amountUSD,
                history: [{ date: new Date(), amount: deposit.amount, invested: amountUSD }]
            })
        }

        // Save transaction
        user.transactions.push({
            type: "deposit",
            coin: deposit.coin,
            amountCrypto: deposit.amount,
            amountUSD,
            date: new Date()
        })

        await user.save()

        // Mark deposit as approved
        deposit.status = "approved"
        deposit.updatedAt = new Date()
        await deposit.save()

        res.json({ message: "Deposit approved and wallet updated." })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
}

// Admin rejects deposit
export const rejectDeposit = async (req, res) => {
    try {
        const { depositId } = req.params
        const deposit = await Deposit.findById(depositId)
        if (!deposit) return res.status(404).json({ message: "Deposit not found" })

        if (deposit.status !== "pending")
            return res.status(400).json({ message: "Deposit already processed" })

        deposit.status = "rejected"
        deposit.updatedAt = new Date()
        await deposit.save()

        res.json({ message: "Deposit rejected." })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
}

// === 4. GET ALL DEPOSITS (ADMIN OR USER SELF) ===
export const getAllDeposits = async (req, res) => {
    try {
        const { status, userId } = req.query

        // Base filter
        const filter = {}
        if (status) filter.status = status
        if (userId) filter.userId = userId

        // If user is not admin, restrict to their own deposits
        if (req.user.role !== "admin") {
            filter.userId = req.user.id
        }

        const deposits = await Deposit.find(filter)
            .populate("userId", "email balance") // populate basic user info
            .sort({ createdAt: -1 })

        res.json({ count: deposits.length, deposits })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Failed to fetch deposits" })
    }
}