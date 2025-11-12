import User from "../models/User.js"
import Deposit from "../models/Deposit.js"
import { getPrice } from "../services/prices.js"

// === 1. INITIATE DEPOSIT (USER ACTION) ===
export const initiateDeposit = async (req, res) => {
    try {
        const { coin, amountCrypto } = req.body
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ message: "User not found" })

        const price = await getPrice(coin)
        const amountUSD = price * amountCrypto

        // Simulated unique address
        const address = `bittop-${coin}-${user._id}-${Date.now()}`

        // Create pending deposit
        const deposit = await Deposit.create({
            userId: user._id,
            coin,
            amountCrypto,
            amountUSD,
            address,
            status: "pending"
        })

        res.status(201).json({
            message: "Deposit initiated successfully",
            deposit: {
                id: deposit._id,
                coin,
                amountCrypto,
                amountUSD,
                address,
                status: "pending"
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Failed to initiate deposit" })
    }
}


// === 2. CONFIRM DEPOSIT (ADMIN ACTION) ===
export const confirmDeposit = async (req, res) => {
    try {
        const { id } = req.params
        const deposit = await Deposit.findById(id)
        if (!deposit) return res.status(404).json({ message: "Deposit not found" })
        if (deposit.status !== "pending") return res.status(400).json({ message: "Deposit already processed" })

        const user = await User.findById(deposit.userId)
        if (!user) return res.status(404).json({ message: "User not found" })

        // Update wallet balance
        user.balance += deposit.amountUSD

        // Update portfolio
        const existing = user.portfolio.find(p => p.coin === deposit.coin)
        if (existing) {
            existing.amount += deposit.amountCrypto
            existing.invested += deposit.amountUSD
            existing.history.push({
                date: new Date(),
                amount: deposit.amountCrypto,
                invested: deposit.amountUSD
            })
        } else {
            user.portfolio.push({
                coin: deposit.coin,
                amount: deposit.amountCrypto,
                invested: deposit.amountUSD,
                history: [{ date: new Date(), amount: deposit.amountCrypto, invested: deposit.amountUSD }]
            })
        }

        // Record transaction
        user.transactions.push({
            type: "deposit",
            coin: deposit.coin,
            amountCrypto: deposit.amountCrypto,
            amountUSD: deposit.amountUSD,
            date: new Date()
        })

        // Update deposit status
        deposit.status = "confirmed"
        deposit.confirmedAt = new Date()

        await user.save()
        await deposit.save()

        res.json({ message: "Deposit confirmed successfully", balance: user.balance })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Failed to confirm deposit" })
    }
}


// === 3. ADMIN REJECT (OPTIONAL) ===
export const rejectDeposit = async (req, res) => {
    try {
        const { id } = req.params
        const deposit = await Deposit.findById(id)
        if (!deposit) return res.status(404).json({ message: "Deposit not found" })

        deposit.status = "rejected"
        await deposit.save()
        res.json({ message: "Deposit rejected" })
    } catch (error) {
        res.status(500).json({ message: "Failed to reject deposit" })
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

