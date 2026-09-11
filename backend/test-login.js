import mongoose from "mongoose";
import { User } from "./models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  let email = "test_" + Date.now() + "@test.com";
  let username = "testuser_" + Date.now();
  let password = "Password1234";

  // 1. REgISTER
  const res1 = await fetch("https://job-portal-web-gmat.onrender.com/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password, role: "jobseeker" })
  });
  console.log("Register:", res1.status, await res1.json());

  // 2. Fetch token from DB
  let user = await User.findOne({ email });
  if (!user) { console.log("NO USER FOUND IN DB", email); return; }

  // 3. Verify
  const token = user.emailVerificationToken; // Wait, it's hashed in DB!
  // Oh, I can't get the unhashed token from DB. Let me just manually verify them in DB.
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save({ validateBeforeSave: false });
  console.log("Verified in DB");

  // 4. Login
  const res2 = await fetch("https://job-portal-web-gmat.onrender.com/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  console.log("Login:", res2.status, await res2.json());

  await User.deleteOne({ email });
  process.exit(0);
}

run().catch(console.error);
