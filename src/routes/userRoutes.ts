import express from "express"
import { searchUser, updateStatus } from "../controllers/userController"

const router = express.Router()


router.get('/search-user/:query', searchUser)

router.put('/update-status', updateStatus)


export default router



