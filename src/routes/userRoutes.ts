import express from "express"
import { addContact, getContactDetails, searchUser, updateStatus } from "../controllers/userController"

const router = express.Router()

router.get('/search-user/:query', searchUser)
router.put('/update-status', updateStatus)
router.post('/add-contact', addContact)
router.get('/contacts-details', getContactDetails)

export default router



