
import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import routes from "./routes.js";

const app=express();
const port=Number(process.env.PORT||5000);
app.use(cors({origin:process.env.FRONTEND_URL||"http://localhost:5173"}));
app.use(express.json());
app.use("/api",routes);
app.use((err,_req,res,_next)=>{console.error(err);res.status(500).json({message:err.message||"Server error"});});

connectDB(process.env.MONGODB_URI).then(()=>{
  app.listen(port,()=>console.log(`HyperLocal backend running on http://localhost:${port}`));
}).catch(err=>{console.error("Database connection failed:",err.message);process.exit(1)});
