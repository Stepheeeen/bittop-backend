import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { adminAccess } from "../middleware/adminMiddleware.js"
import {
  initiateDeposit,
  getAllDeposits,
  confirmDeposit,
  rejectDeposit
} from "../controllers/depositController.js"

const router = express.Router()

// user
router.post("/initiate", protect, initiateDeposit)
router.get("/", protect, getAllDeposits)

// admin-only
router.patch("/confirm/:id", adminAccess, confirmDeposit)
router.patch("/reject/:id", adminAccess, rejectDeposit)

export default router
