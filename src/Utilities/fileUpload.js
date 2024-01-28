import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

console.log(process.env.CLOUDINARY_API_KEY,process.env.CLOUDINARY_API_SECRET);
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

const uploadOnCloud = async (filePath) => {
    try {
        if (filePath){
            console.log(filePath);
            const response = await cloudinary.uploader.upload(filePath,{
                resource_type: "auto"
            })
            console.log("file is uploaded on clound",response);
            //fs.unlinkSync(filePath);
            return response;
        }
        else{
            return "filePath is null";
        }
    } catch (error) {
        console.log(error);
        //fs.unlinkSync(filePath); //removed temp file 
        return null;
    }
}

export {uploadOnCloud};

