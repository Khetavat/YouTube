import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
    },
    avatar: {
        type: String, // cloudinary url
        required: true
    },
    converImage: {
        type: String // cloudinary url
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true,"Password is required"]
    },
    refreshToken: {
        type: String
    }
},{timestamps: true})

userSchema.pre("save", async function (next){
    if (this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
    }
    next();
})

// can add our own methods , if isPasswordCorrect is exit it will use otherwise create it
userSchema.methods.isPasswordCorrrect = async function (password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function (){
    const data = {
        _id: this._id,
        email: this.email
    }

    return jwt.sign(data,process.env.ACCESS_TOKEN_SECRET,{expiresIn: process.env.ACCESS_TOKEN_EXPIRY})
}

userSchema.methods.generateRefreshToken = function (){
    const data = {
        _id: this._id
    }

    return jwt.sign(data,process.env.REFRESH_TOKEN_SECRET,{expiresIn: process.env.REFRESH_TOKEN_EXPIRY})
}
export const User = mongoose.model("User",userSchema);