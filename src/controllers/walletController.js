import User from "../models/User.js"
import { getPrices } from "../services/prices.js"

export const deposit = async (req, res) => {
  const { coin, amountCrypto } = req.body
  const user = await User.findById(req.user.id)

  const price = await getPrice(coin)
  const amountUSD = price * amountCrypto

  // update wallet balance
  user.balance += amountUSD

  // update portfolio
  const existing = user.portfolio.find(p => p.coin === coin)

  if (existing) {
    existing.amount += amountCrypto
    existing.invested += amountUSD
    existing.history.push({ date: new Date(), amount: amountCrypto, invested: amountUSD })
  } else {
    user.portfolio.push({
      coin,
      amount: amountCrypto,
      invested: amountUSD,
      history: [{ date: new Date(), amount: amountCrypto, invested: amountUSD }]
    })
  }

  // save transaction
  user.transactions.push({
    type: "deposit",
    coin,
    amountCrypto,
    amountUSD,
    date: new Date()
  })

  await user.save()

  res.json({ message: "Deposit successful", balance: user.balance })
}
