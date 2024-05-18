import express from "express"
import { signUp } from "../controllers/userController"

const router = express.Router()


router.get("/signup", signUp)


export default router



