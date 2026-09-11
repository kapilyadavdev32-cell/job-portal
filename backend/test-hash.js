import mongoose from "mongoose";
import { User } from "./models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Create decoy user
  await User.create({ email: "user1@test.com", username: "user1", password: "123" });
  // Create target user 
  await User.create({ email: "user2@test.com", username: "user2", password: "456" });

  let email = "user2@test.com";
  let username = undefined;

  let foundUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log("Expected: user2@test.com");
  console.log("Actually found:", foundUser?.email);

  await User.deleteMany({ email: { $in: ["user1@test.com", "user2@test.com"] } });
  process.exit(0);
}

run().catch(console.error);
