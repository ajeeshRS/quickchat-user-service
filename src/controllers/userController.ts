import { Request, Response } from "express";
import { userProfile } from "../models/userModel";

export const searchUser = async (req: Request, res: Response) => {
        try {
                const queryTerm = req.params.query
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
