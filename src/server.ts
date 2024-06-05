import express from "express"
import routes from "./routes/userRoutes"
import cors from "cors"
import dotenv from "dotenv"
import { connectDb } from "./config/connection"
import { consumeMessage } from "./utils/kafka/user-consumer"
import { createProfile } from "./utils/utils"
dotenv.config()

const PORT = process.env.PORT || 8002
const app = express()


app.use(cors())
app.use(express.json())
app.use("/api/v1/user", routes)


app.listen(PORT, async () => {
    connectDb()
    await consumeMessage('user-profile', createProfile)
    console.log(`Connected to user service on port : ${PORT}`)
})