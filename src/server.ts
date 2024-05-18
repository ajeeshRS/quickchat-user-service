import express from "express"
import routes from "./routes/userRoutes"
import cors from "cors"
import dotenv from "dotenv"
import { connectDb } from "./config/connection"
dotenv.config()

const PORT = process.env.PORT || 8002
const app = express()


app.use(cors())
app.use(express.json())
app.use("/api/v1/user",routes)


app.listen(PORT,()=>{
    connectDb()
    console.log(`Connected to user service on port : ${PORT}`)
})