import express from "express";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json({limit: "10kb"}));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

//routes import
import userRoute from "./src/routes/user.routes.js";


//here controlles pass to userRoute
app.use("/api/v1/users",userRoute);


export default app;