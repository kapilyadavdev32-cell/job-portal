import mongoose from "mongoose";
import { User } from "./models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const email = "kapilyadav.dev32@gmail.com";
  
  const result = await User.deleteMany({ email });
  console.log("Deleted count:", result.deletedCount);
  
  process.exit(0);
}

run().catch(console.error);
