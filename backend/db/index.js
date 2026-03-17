import mongoose from "mongoose"

const connectDB =  async ()=> {
   try{
    await  mongoose.connect(process.env.MONGO_URI);
   }
   catch(err){
      console.error("Mongodb connection failed",err);
      process.exit(1); // Exit if connection fails
   }
 }

 export default connectDB;
