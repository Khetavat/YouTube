import { Router } from "express";
import 
    { 
        registerUser,
        loginUser,
        logoutUser,
        regenerateAccessToken, 
        changeCurrentPassword,
        getCurrentUser,
        updateAvatar,
        updateCoverImage, 
        getUserChannelProfile,
        getWatchHistory 
    } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js"
import {verifyJWT} from "../middlewares/auth.middlwares.js"

const router = Router();

router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(regenerateAccessToken);

router.route("/change-password").post(verifyJWT,changeCurrentPassword);

router.route("/current-user").get(verifyJWT,getCurrentUser);

router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar);

router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"),updateCoverImage);

router.route("/channel/:username").get(verifyJWT,getUserChannelProfile);

router.route("/watch-history").get(verifyJWT,getWatchHistory)
export default router;