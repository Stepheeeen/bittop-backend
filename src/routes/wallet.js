import express from "express"
import { deposit } from "../controllers/walletController.js"
import auth from "../middleware/auth.js"

const router = express.Router()
router.post("/deposit", auth, deposit)

export default router
