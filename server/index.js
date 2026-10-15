import express from "express"
import "dotenv/config"
import connectDB from "./db/connectDB.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/auth.js";
import emotionRoutes from "./routes/emotionRoutes.js";
import cors from "cors";
const app = express();
const PORT = 8000;
// const 

await connectDB();

app.use(express.json()); // VERY IMPORTANT
app.use(cors())

app.get(
    '/',
    (req, res)=> res.send("Index.js")
)

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
})

app.use('/ai',aiRoutes );
app.use("/api/auth", authRoutes);
app.use("/emotion", emotionRoutes);


app.listen(PORT, () => {
    console.log("Server at http://localhost:"+PORT);
})




