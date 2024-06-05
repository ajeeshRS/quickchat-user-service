import { Request, Response } from "express";
import { userProfile } from "../models/userModel";

// export const createProfile = async (req: Request, res: Response) => {
//     try {
       
        // const { userName, email, googleId } = req.body

        // if (!userName || !email) {
        //     return res.status(400).json("All fields are mandatory")
        // }

        // const profileData = {
        //     username: userName,
        //     email: email,
        //     ...(googleId && { googleId })
        // }

        // await userProfile.create(profileData)

        // return res.status(201).json("Profile created")

//     } catch (err) {
//         console.error("Error creating profile", err)
//         return res.status(500).json("Unable to create profile")
//     }
// }
