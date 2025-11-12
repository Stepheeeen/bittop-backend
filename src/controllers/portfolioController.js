import User from "../models/User.js"
import { getPrice } from "../services/prices.js"

export const getPortfolio = async (req, res) => {
  const user = await User.findById(req.user.id)
  const portfolio = []

  for (let asset of user.portfolio) {
    const price = await getPrice(asset.coin)
    const currentValue = price * asset.amount

    portfolio.push({
      coin: asset.coin,
      amount: asset.amount,
      invested: asset.invested,
      currentValue,
      gainLoss: currentValue - asset.invested
    })
  }

  res.json(portfolio)
}
