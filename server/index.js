import express from "express"
import "dotenv/config"
import connectDB from "./db/connectDB.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();
const PORT = 8000;
// const 

await connectDB();
app.get(
    '/',
    (req, res)=> res.send("Index.js")
)

app.use('/ai',aiRoutes );

app.listen(PORT, () => {
    console.log("Server at http://localhost:"+PORT);
})

const express = require("express");


app.use(express.json()); // VERY IMPORTANT

const authRoutes = require("./routes/auth.js");
app.use("/api/auth", authRoutes);
