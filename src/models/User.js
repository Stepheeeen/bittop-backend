import mongoose from "mongoose"

const portfolioSchema = new mongoose.Schema({
  coin: String,
  amount: Number,
  invested: Number,
  history: [{ date: Date, amount: Number, invested: Number }]
})

const transactionSchema = new mongoose.Schema({
  type: String,
  coin: String,
  amountCrypto: Number,
  amountUSD: Number,
  date: Date
})

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  phone: String,
  balance: { type: Number, default: 0 },
  lastPasswordChange: Date,
  portfolio: [portfolioSchema],
  transactions: [transactionSchema]
})

export default mongoose.model("User", userSchema)
