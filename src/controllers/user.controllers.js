import { ApiError } from "../Utilities/apiError.js";
import { User } from "../models/user.models.js";
import {uploadOnCloud} from "../Utilities/fileUpload.js"
import {ApiResponse} from "../Utilities/apiResponse.js"
import jwt from "jsonwebtoken";
// give the Access and Refresh token
async function generateAccessAndRefreshToken(userId){
    try {
        const user = await User.findById(userId);
        console.log(user);
        if (user){
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();
            
            // update the user with refreshToken
            const updatedUser = await user.updateOne({
                $set: {refreshToken}
            },{
                new: true // get the updated user
            })
    
            return {accessToken,refreshToken};
        }
    } catch (error) {
        throw new ApiError(500,error?.message || "Something went wrong while generating access token");
    }
}

const registerUser = async function(req,res){
    // get user details from frontend
    // validation - not empty
    // check if user is already exists using username or email
    // check for required fields like avater, password
    // upload the images,avatar to cloud
    // create user object,create entry in database
    // check for user creation
    // return res without password, refreshtoken

    // try {
       
    // } catch (error) {
    //     console.log("Somethig went wrong",error);
    // }

    const {username,email,fullname,password} = req.body;
    console.log(username,email,fullname,password);

    if (typeof username === 'undefined' || username === null || username?.trim() === ""){
        throw new ApiError(400,"username field is required");
    }
    if (typeof email === 'undefined' || email === null || email?.trim() === ""){
        throw new ApiError(400,"email field is required");
    }
    if (typeof fullname === 'undefined' || fullname === null || fullname?.trim() === ""){
        throw new ApiError(400,"fullname field is required");
    }
    if (typeof password === 'undefined' || password === null || password?.trim() === ""){
        throw new ApiError(400,"username field is required");
    }

    const checkExistedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if (checkExistedUser){
        throw new ApiError(409,"User with email or username is already exist");
    }
    console.log(req.files);
    let avatarLocalPath;
    //multer gives the access to this fxn
    if (req.files && req.files.avatar && req.files.avatar[0] && req.files.avatar[0].path){
        avatarLocalPath = req.files.avatar[0].path;
    }
    else{
        throw new ApiError(400,"Avatar file is required");
    }
    
    let coverImageLocalPath;
    if (req.files && req.files.coverImage && req.files.coverImage[0] && req.files.coverImage[0].path){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const avatar = await uploadOnCloud(avatarLocalPath);
    const coverImage = await uploadOnCloud(coverImageLocalPath);
    console.log(avatar);
    if (!avatar){
        throw new ApiError(400,"Avatar file is required");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username,
        password
    })

    // select will not select the mentioned columns
    const checkUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res.status(201).json(
        new ApiResponse(200,checkUser,"User Created Successfully !!")
    );

}

const loginUser = async function(req,res){
    // get data from req.body
    // find user
    // check password
    // generate access and refresh token
    // send cookie

    const {email,password} = req.body;

    if (!email){
        throw new ApiError(401,"email is required");
    }

    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404,"Invalid username");
    }
    
    // we have isPasswordCorrrect() in user models so we need to use "user" (bcz isPasswordCorrrect is created by us not mongoose)
    // to access it not "User"
    const isPasswordValid = await user.isPasswordCorrrect(password);

    if(!isPasswordValid){
        throw new ApiError(404,"Invalid password");
    }

    const userResponse = await User.findById(user._id).select("-password -refreshToken");
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);

    // return access and refresh token in form of cookies
    // for this need to use cookie parser middleware , it gives the req.cookie object

    // to modify cookies only from server side
    const options = {
        httpOnly: true,
        secure: true
    }

    res
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,
        {
        user: userResponse,
        accessToken
        },
        "User logged in successfully"
    ))

}

const logoutUser = async function(req,res){
    // to logout the user we need to remove the refreshToken from user database
    // for this need to create one auth middleware to give the req.user object from cookies or accesstoken 

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(
                new ApiResponse(200,{},"User logged out successfully")
            )
}

const regenerateAccessToken = async function(req,res){
    // with the help of user refresh token and saved refresh token 
    // we will compare this two refresh token, if they are same then we will genrate the new access token and vice versa

    try {
        const refreshToken = req.cookie?.refreshToken || req.headers("Authorization").replace("Bearer ","");
    
        if (!refreshToken){
            throw new ApiError(401,"Unauthorized request");
        }
    
        const decodedRefreshToken = await jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
    
        if(!decodedRefreshToken){
            throw new ApiError(401,"Invalide Refresh Token");
        }
    
        const user = await User.findById(decodedRefreshToken._id);
    
        if (!user){
            throw new ApiError(401,"Invalide Refresh Token");
        }
    
        if (refreshToken !== user.refreshToken){
            throw new ApiError(401,"Refresh token is expired");
        }
    
        const accessToken = user.generateAccessToken();
        
        return res.cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(
            200,
            {
                accessToken,
                refreshToken
            },
            "Access Token refreshed"
        ))
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalide refresh token");
    }

}
export {registerUser,loginUser,logoutUser,regenerateAccessToken};