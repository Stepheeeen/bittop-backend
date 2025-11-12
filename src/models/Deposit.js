import mongoose from "mongoose"

const depositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coin: { type: String, required: true },
  amountCrypto: { type: Number, required: true },
  amountUSD: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "confirmed", "rejected"], default: "pending" },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  confirmedAt: { type: Date }
})

export default mongoose.model("Deposit", depositSchema)
