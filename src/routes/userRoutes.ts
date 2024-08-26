import express from "express";
import {
  addContact,
  deleteContact,
  getContactDetails,
  searchUser,
  updateStatus,
  getUsersDetails,
  addChatToProfile,
} from "../controllers/userController";

const router = express.Router();

router.get("/search-user/:query", searchUser);
router.put("/update-status", updateStatus);
router.post("/add-contact", addContact);
router.get("/contacts-details", getContactDetails);
router.delete("/delete-contact", deleteContact);
router.get("/usersdetails", getUsersDetails);
router.post("/add-chat", addChatToProfile);

export default router;
