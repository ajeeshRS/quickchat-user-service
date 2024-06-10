import express from "express"
import { searchUser } from "../controllers/userController"

const router = express.Router()


router.get('/search-user/:query', searchUser)


export default router



