import { ApiError } from "../Utilities/apiError.js";
import { User } from "../models/user.models.js";
import {uploadOnCloud} from "../Utilities/fileUpload.js"
import {ApiResponse} from "../Utilities/apiResponse.js"
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
        res.json(new ApiError(400,"username field is required"));
    }
    if (typeof email === 'undefined' || email === null || email?.trim() === ""){
        res.json(new ApiError(400,"email field is required"));
    }
    if (typeof fullname === 'undefined' || fullname === null || fullname?.trim() === ""){
        res.json(new ApiError(400,"fullname field is required"));
    }
    if (typeof password === 'undefined' || password === null || password?.trim() === ""){
        res.json(new ApiError(400,"username field is required"));
    }

    const checkExistedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if (checkExistedUser){
        res.json(new ApiError(409,"User with email or username is already exist"));
    }
    console.log(req.files);
    let avatarLocalPath;
    //multer gives the access to this fxn
    if (req.files && req.files.avatar && req.files.avatar[0] && req.files.avatar[0].path){
        avatarLocalPath = req.files.avatar[0].path;
    }
    else{
        res.json(new ApiError(400,"Avatar file is required"));
    }
    
    let coverImageLocalPath;
    if (req.files && req.files.coverImage && req.files.coverImage[0] && req.files.coverImage[0].path){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const avatar = await uploadOnCloud(avatarLocalPath);
    const coverImage = await uploadOnCloud(coverImageLocalPath);
    console.log(avatar);
    if (!avatar){
        res.json(new ApiError(400,"Avatar file is required"));
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

    res.end();
}

export {registerUser};