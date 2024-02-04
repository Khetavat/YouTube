import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId, // one who is subscripbing
        ref: "User"
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId, // one to whom 
        //'subscriber' is subcribing
        ref: "User"
    },

},{timestamps: true});



export const Subscription = mongoose.model("Subscription",subscriptionSchema);