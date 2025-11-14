import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;

app.get("/health",(req,res)=>{
  res.send("Ok");
})

app.listen(PORT,()=>{
  console.log(`Appliction is running on PORT :- ${PORT}`);
})