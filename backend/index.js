import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { validateEnv } from "./config/validateEnv.js";

dotenv.config();
validateEnv();

const PORT = process.env.PORT || 8000;

connectDB()
.then(()=>{
    app.listen(PORT , ()=>{console.log(`Server is Running on Port ${PORT}`)})
})
.catch((err)=>{
    console.error("MongoDb connection Error",err);
});

