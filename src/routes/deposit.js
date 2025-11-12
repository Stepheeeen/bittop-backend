import express from "express"
import { protect, admin } from "../middleware/authMiddleware.js"
import { initiateDeposit, approveDeposit, rejectDeposit, getAllDeposits } from "../controllers/depositController.js"

const router = express.Router()

router.post("/initiate", protect, initiateDeposit)
router.get("/", protect, getAllDeposits)
router.patch("/approve/:depositId", protect, admin, approveDeposit)
router.patch("/reject/:depositId", protect, admin, rejectDeposit)

export default router
