import express from "express"
import "dotenv/config"
import connectDB from "./db/connectDB.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/auth.js"

const app = express();
const PORT = 8000;
// const 

await connectDB();

app.use(express.json()); // VERY IMPORTANT


app.get(
    '/',
    (req, res)=> res.send("Index.js")
)

app.use('/ai',aiRoutes );
app.use("/api/auth", authRoutes);



app.listen(PORT, () => {
    console.log("Server at http://localhost:"+PORT);
})




