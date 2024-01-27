import mongoose from "mongoose";
import dotenv from "dotenv";
import { DatabaseName } from "../../constants.js";

dotenv.config();

const databaseConnection = async function DbConnect(){
    try 
    {
        const connectionInstance = await mongoose.connect(`${process.env.DATABASEURL}/${DatabaseName}`);
        console.log(`Database Connected Successfully !! ${connectionInstance.connection.host}`);
    } catch (error) 
    {
        console.log("MongoDB connection failed",error.message);
        process.exit(1);
    }
}

export default databaseConnection;