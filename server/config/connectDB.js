import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();



if(!process.env.MONGODB_URI){
    throw new Error(
        "Please provide MongoDB URI in the .env file"
    )
}

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDB connected successfully");        
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
        process.exit(1);
    }
}

export default connectDB;