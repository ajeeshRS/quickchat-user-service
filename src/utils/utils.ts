import { userProfile } from "../models/userModel"

export const createProfile = async (message: any) => {
    const { userName, email, googleId } = message

    if (!userName || !email) {
        console.error("All fields are mandotory")
    }

    const profileData = {
        username: userName,
        email: email,
        ...(googleId && { googleId })
    }

    await userProfile.create(profileData)
    console.log("user profile created")
}