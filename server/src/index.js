import express from "express";
import {fromNodeHeaders,toNodeHandler } from "better-auth/node";
import dotenv from "dotenv";
import {auth }from "./lib/auth.js"
dotenv.config();
import cors from "cors"

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS middleware
app.use(
  cors({
    origin: "http://localhost:3001", // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);


app.all("/api/auth/*splat", toNodeHandler(auth)); //For ExpressJS v5 
app.use(express.json());



app.get("/api/me", async (req, res) => {
 	const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
	return res.json(session);
});

app.get("/health",(req,res)=>{
  res.send("Ok");
})

app.listen(PORT,()=>{
  console.log(`Appliction is running on PORT :- ${PORT}`);
})