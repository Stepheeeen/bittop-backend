import User from "../models/User.js"
import Deposit from "../models/Deposit.js"

// === 1. Initiate Deposit (user submits) ===
export const initiateDeposit = async (req, res) => {
  try {
    const { coin, network, address, amount } = req.body

    if (!coin || !network || !address || !amount) {
      return res.status(400).json({ message: "All fields are required." })
    }

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    const newDeposit = new Deposit({
      userId: user._id,
      coin,
      network,
      address,
      amount: parseFloat(amount),
      status: "pending",
      createdAt: new Date(),
    })

    await newDeposit.save()

    res.json({
      message: "Deposit submitted successfully. Await admin confirmation.",
      deposit: newDeposit,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error while initiating deposit." })
  }
}

// === 2. Admin Approves Deposit ===
export const approveDeposit = async (req, res) => {
  try {
    const { depositId } = req.params
    const deposit = await Deposit.findById(depositId)
    if (!deposit) return res.status(404).json({ message: "Deposit not found" })

    if (deposit.status !== "pending")
      return res.status(400).json({ message: "Deposit already processed" })

    const user = await User.findById(deposit.userId)
    if (!user) return res.status(404).json({ message: "User not found" })

    // For simplicity, assume USD = 1:1 value — we’re not calling CoinGecko
    const amountUSD = deposit.amount

    user.balance = (user.balance || 0) + amountUSD

    // Update portfolio
    const existing = user.portfolio.find((p) => p.coin === deposit.coin)
    if (existing) {
      existing.amount += deposit.amount
      existing.invested += amountUSD
      existing.history.push({
        date: new Date(),
        amount: deposit.amount,
        invested: amountUSD,
      })
    } else {
      user.portfolio.push({
        coin: deposit.coin,
        amount: deposit.amount,
        invested: amountUSD,
        history: [{ date: new Date(), amount: deposit.amount, invested: amountUSD }],
      })
    }

    // Save transaction
    user.transactions.push({
      type: "deposit",
      coin: deposit.coin,
      amountCrypto: deposit.amount,
      amountUSD,
      date: new Date(),
    })

    await user.save()

    deposit.status = "approved"
    deposit.updatedAt = new Date()
    await deposit.save()

    res.json({ message: "Deposit approved and wallet updated.", deposit })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error while approving deposit." })
  }
}

// === 3. Admin Rejects Deposit ===
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

    res.json({ message: "Deposit rejected.", deposit })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error while rejecting deposit." })
  }
}

// === 4. Get All Deposits (Admin or User Self) ===
export const getAllDeposits = async (req, res) => {
  try {
    const { status, userId } = req.query

    const filter = {}
    if (status) filter.status = status
    if (userId) filter.userId = userId

    // Non-admins can only see their own deposits
    if (req.user.role !== "admin") {
      filter.userId = req.user.id
    }

    const deposits = await Deposit.find(filter)
      .populate("userId", "email balance")
      .sort({ createdAt: -1 })

    res.json({ count: deposits.length, deposits })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to fetch deposits" })
  }
}
