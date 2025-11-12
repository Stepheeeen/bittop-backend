import mongoose from "mongoose"

const depositSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coin: { type: String, required: true },
    network: { type: String, required: true },
    amount: { type: Number, required: true },
    address: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

export default mongoose.model("Deposit", depositSchema)
