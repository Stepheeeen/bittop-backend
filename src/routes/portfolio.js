import express from "express"
import auth from "../middleware/auth.js"
import { getPortfolio } from "../controllers/portfolioController.js"

const router = express.Router()
router.get("/", auth, getPortfolio)

export default router
