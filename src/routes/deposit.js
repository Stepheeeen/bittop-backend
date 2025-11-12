import express from "express"
import auth from "../middleware/auth.js"
import {approveDeposit, rejectDeposit, getAllDeposits, initiateDeposit } from "../controllers/depositController.js"
import { adminAccess } from "../middleware/adminMiddleware.js"

const router = express.Router()

router.post("/initiate", auth, initiateDeposit)
router.get("/all", auth, getAllDeposits)
router.patch("/approve/:depositId", auth, adminAccess, approveDeposit)
router.patch("/reject/:depositId", auth, adminAccess, rejectDeposit)

export default router
