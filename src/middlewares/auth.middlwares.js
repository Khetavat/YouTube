import { ApiError } from "../Utilities/apiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
const verifyJWT = async function(req,res,next){
    try {
        const accessToken = req.cookies?.accessToken || 
                        req.headers("Authorization")?.replace("Bearer ","");
        
        if (!accessToken){
            throw new ApiError(401,"Unauthorized request");
        }
    
        const decodedToken = await jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id)
        .select("-password,-refreshToken");
    
        if (!user){
            throw new ApiError(401,"Invalide access token");
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(500,error?.message || "Error while decoding access token");
    }
}

export {verifyJWT};