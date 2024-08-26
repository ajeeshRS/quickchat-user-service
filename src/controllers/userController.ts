import { Request, Response } from "express";
import { userProfile } from "../models/userModel";
import { produceMessage } from "../utils/kafka/user-producer";

export const searchUser = async (req: Request, res: Response) => {
  try {
    const queryTerm = req.params.query;

    // aggregation pipeline for getting result for searching a user
    const result = await userProfile.aggregate([
      {
        $match: {
          $or: [
            { userName: { $regex: queryTerm, $options: "i" } },
            { email: { $regex: queryTerm, $options: "i" } },
          ],
        },
      },
      {
        $lookup: {
          from: "userconnections",
          localField: "email",
          foreignField: "email",
          as: "connections",
        },
      },
      {
        $unwind: "$connections",
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$connections", "$$ROOT"],
          },
        },
      },
      {
        $project: {
          username: 1,
          email: 1,
          profilePicture: 1,
          bio: 1,
          status: 1,
          socketId: "$connections.socketId",
          _id: 0,
        },
      },
    ]);
    console.log(result);
    res.status(200).json(result);
  } catch (err) {
    console.error("some error in fetching data: ", err);
    res.status(500).json("Internal server error");
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { email, status } = req.body;
    const online = status === "online";
    const offline = status === "offline";

    if (!email || !status) {
      return res.status(403).json("Email and status are required ");
    }
    const user = await userProfile.findOne({ email: email });

    // updates the user status
    if (user) {
      user.status = status;
      await user.save();
      res
        .status(200)
        .json(
          online
            ? "Online status updated success"
            : offline && "Offline status updated success"
        );
    }
  } catch (err) {
    res.status(500).json("Internal server error");
    console.error("Some error occured during updating status: ", err);
  }
};

export const addContact = async (req: Request, res: Response) => {
  try {
    const { email, contactEmail, contactUsername } = req.body;

    if (!email || !contactEmail || !contactUsername) {
      return res.status(403).json("Credentials missing");
    }

    const user = await userProfile.findOne({ email });
    if (!user) {
      return res.status(404).json("user profile not found");
    }

    console.log(contactEmail);
    const peerUser = await userProfile.findOne({ email: contactEmail });
    if (!peerUser) {
      return res.status(404).json("Peer profile not found");
    }

    const existingContact = user.contacts.some(
      (contact) =>
        contact.username == contactUsername || contact.email == contactEmail
    );

    if (existingContact) {
      return res.status(409).json("contact already exist");
    }

    user.contacts.push({ email: contactEmail, username: contactUsername });
    const data = {
      userName: user.username,
      peerUserName: peerUser.username,
      id: user._id,
      peerId: peerUser._id,
    };
    if (!data) {
      return res.status(403).json("Missing details");
    }
    // sending it to the chat service to create a new chat
    await produceMessage("new-chat", data);
    await user.save();
    console.log(user);

    res.status(200).json("Added to contacts");
  } catch (err) {
    console.error("Error in adding to contacts: ", err);
    res.status(500).json("Internal server error");
  }
};

export const getContactDetails = async (req: Request, res: Response) => {
  try {
    const contactEmails: any = req.query.emails;
    const emails: string[] = contactEmails.split(",");
    console.log(emails);

    if (!emails) {
      return res.status(403).json("Emails not provided");
    }

    const contactDetails = await userProfile.aggregate([
      {
        $match: { email: { $in: emails } },
      },
      {
        $lookup: {
          from: "userconnections",
          localField: "email",
          foreignField: "email",
          as: "details",
        },
      },
      {
        $unwind: {
          path: "$details",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          username: 1,
          profilePicture: 1,
          bio: 1,
          status: 1,
          socketId: "$details.socketId",
          email: 1,
          _id: 1,
        },
      },
    ]);

    res.status(200).json({ contactDetails });
  } catch (err) {
    console.error("Error in fetching contact details: ", err);
    res.status(500).json("Error in fetching contact details");
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    // get the details from the query
    const { email, contactEmail } = req.query;
    if (!email || !contactEmail) {
      console.error("Details missing");
      return res.status(403).json("Details missing");
    }
    console.log(email, contactEmail);

    //check for the user
    const user = await userProfile.findOne({ email: email });

    if (!user) {
      console.error("user not found");
      return res.status(404).json("User not found");
    }

    // update the contacts array by removing the specific contact
    const updatedContacts = user.contacts.filter(
      (contact, index) => contact.email !== contactEmail
    );
    console.log(updatedContacts);

    // update the userProfile with the updated array
    await userProfile.updateOne(
      { email: email },
      { $set: { contacts: updatedContacts } }
    );

    console.log("contact deleted!!");
    res.status(200).json("Contact deleted");
  } catch (err) {
    console.error("Error in deleting contact: ", err);
    res.status(500).json("Couldn't delete the contact");
  }
};

export const getUsersDetails = async (req: Request, res: Response) => {
  try {
    const { senderEmail, recipientEmail } = req.query;
    // console.log(`sender:${senderEmail}  , recipient:${recipientEmail}`);

    const result = await userProfile.find(
      {
        email: { $in: [senderEmail, recipientEmail] },
      },
      { email: 1, username: 1, _id: 1 }
    );

    // console.log(result);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
  }
};

export const addChatToProfile = async (req: Request, res: Response) => {
  try {
    const { chatId, peerId, userId } = req.body;

    const result = await userProfile.updateMany(
      { _id: { $in: [userId, peerId] } },
      { $addToSet: { chats: chatId } }
    );
    console.log(result);
    res.status(200).json("Chat added to user profiles");
  } catch (err) {
    console.error("Error in adding chat to profile: ", err);
    res.status(500).json("Internal server Error");
  }
};
