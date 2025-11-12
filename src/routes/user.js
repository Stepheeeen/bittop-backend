import express from "express"
import auth from "../middleware/auth.js"
import {
  getProfile,
  updatePhone,
  changePassword
} from "../controllers/userController.js"

const router = express.Router()

router.get("/profile", auth, getProfile)
router.put("/phone", auth, updatePhone)
router.put("/password", auth, changePassword)

export default router
