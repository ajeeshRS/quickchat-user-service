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
                                $unwind:"$connections"
                        },
                        {
                                $replaceRoot:{
                                        newRoot:{
                                                $mergeObjects:['$connections','$$ROOT']
                                        }
                                }

                        },
                        {
                                $project: {
                                        username: 1,
                                        email: 1,
                                        profilePicture: 1,
                                        bio: 1,
                                        socketId: '$connections.socketId',
                                        _id:0
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
