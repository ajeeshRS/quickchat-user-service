import { Request, Response } from "express";
import { userProfile } from "../models/userModel";

export const searchUser = async (req: Request, res: Response) => {
        try {
                const queryTerm = req.params.query

                // aggregation pipeline for getting result for searching a user
                const result = await userProfile.aggregate([
                        {
                                $match: {
                                        $or: [
                                                { userName: { $regex: queryTerm, $options: 'i' } },
                                                { email: { $regex: queryTerm, $options: 'i' } },
                                        ]
                                }
                        },
                        {
                                $lookup: {
                                        from: 'userconnections',
                                        localField: 'email',
                                        foreignField: 'email',
                                        as: 'connections',
                                }
                        },
                        {
                                $unwind: "$connections"
                        },
                        {
                                $replaceRoot: {
                                        newRoot: {
                                                $mergeObjects: ['$connections', '$$ROOT']
                                        }
                                }

                        },
                        {
                                $project: {
                                        username: 1,
                                        email: 1,
                                        profilePicture: 1,
                                        bio: 1,
                                        status: 1,
                                        blockedContacts: 1,
                                        contacts: 1,
                                        socketId: '$connections.socketId',
                                        _id: 0
                                }
                        }
                ])
                console.log(result)
                res.status(200).json(result)
        } catch (err) {
                console.error("some error in fetching data: ", err)
                res.status(500).json('Internal server error')
        }
}

export const updateStatus = async (req: Request, res: Response) => {
        try {
                const { email, status } = req.body
                const online = status === 'online'
                const offline = status === 'offline'

                if (!email || !status) {
                        return res.status(403).json("Email and status are required ")
                }
                const user = await userProfile.findOne({ email: email })

                // updates the user status
                if (user) {
                        user.status = status
                        await user.save()
                        res.status(200).json(online ? "Online status updated success" : offline && "Offline status updated success")
                }

        } catch (err) {
                res.status(500).json("Internal server error")
                console.error('Some error occured during updating status: ', err)
        }
}

export const addContact = async (req: Request, res: Response) => {
        try {
                const { email, contactEmail, contactUsername } = req.body

                if (!email || !contactEmail || !contactUsername) {
                        return res.status(403).json("Credentials missing")
                }

                const user = await userProfile.findOne({ email })
                if (!user) {
                        return res.status(404).json("user profile not found")
                }

                const existingContact = user.contacts.some((contact) => 
                        contact.username == contactUsername || contact.email == contactEmail
                )

                if (existingContact) {
                        return res.status(409).json("contact already exist")
                }

                user.contacts.push({ email: contactEmail, username: contactUsername })
                await user.save()
                res.status(200).json("Added to contacts")

        } catch (err) {
                console.error("Error in adding to contacts: ", err)
                res.status(500).json("Internal server error")
        }
}
