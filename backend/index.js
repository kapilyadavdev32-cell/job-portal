import app from "./app.js"
import dotenv from "dotenv"
import connectDB from "./db/index.js"
dotenv.config();
const PORT = process.env.PORT||8000;

connectDB()
.then(()=>{
    app.listen(PORT , ()=>{console.log(`Server is Running on Port ${PORT}`)})
})
.catch((err)=>{
    console.error("MongoDb connection Error",err);
});

