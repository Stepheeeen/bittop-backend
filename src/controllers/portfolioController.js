import User from "../models/User.js"
import { getPrices } from "../services/prices.js"

export const getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: "User not found" })

    const coins = user.portfolio.map(asset => asset.coin)
    const prices = await getPrices(coins)

    const portfolio = user.portfolio.map(asset => {
      const price = prices[asset.coin] || 0
      const currentValue = price * asset.amount
      return {
        coin: asset.coin,
        amount: asset.amount,
        invested: asset.invested,
        currentValue,
        gainLoss: currentValue - asset.invested
      }
    })

    res.json(portfolio)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch portfolio data" })
  }
}
