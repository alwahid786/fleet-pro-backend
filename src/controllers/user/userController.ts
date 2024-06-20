import bcrypt from "bcrypt";
import { Request } from "express";
import createHttpError from "http-errors";
import path from "node:path";
import { config } from "../../config/config.js";
import { __dirName, accessTokenOptions, refreshTokenOptions } from "../../constants/costants.js";
import { JWTService } from "../../services/jwtToken.js";
import { sendMail } from "../../services/sendMail.js";
import { UserTypes } from "../../types/userTypes.js";
import { TryCatch } from "../../utils/tryCatch.js";
import { User } from "../../models/userModel/user.model.js";
import { getDataUri, uploadOnCloudinary } from "../../utils/cloudinary.js";

//--------------------
// register controller
//--------------------
const register = TryCatch(async (req: Request<{}, {}, UserTypes>, res, next) => {
    // get all body data and validate
    const { firstName, lastName, email, address, phoneNumber, password } = req.body;
    const image: Express.Multer.File | undefined = req.file;
    if (!image) return next(createHttpError(400, "Please Upload Profile Image"));
    if (!email || !password || !firstName || !lastName || !address || !phoneNumber)
        return next(createHttpError(400, "Please Enter All Required Fields"));
    // check user email is already exists
    const emailExists = await User.exists({ email });
    if (emailExists) return next(createHttpError(400, "Email Already Exists"));
    // upload image on cloudinary
    const fileUrl = getDataUri(image);
    if (!fileUrl.content) return next(createHttpError(400, "Error While Making a Url of user Image"));
    const myCloud = await uploadOnCloudinary(fileUrl.content!, "user");
    if (!myCloud?.public_id || !myCloud?.secure_url)
        return next(createHttpError(400, "Error While Uploading User Image on Cloudinary"));
    // create user
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        firstName,
        lastName,
        phoneNumber,
        address,
        email,
        image: { url: myCloud.secure_url, public_id: myCloud.public_id },
        password: hashPassword,
    });
    if (!user) return next(createHttpError(400, "Some Error While Creating User"));
    // create verification url and send mail to user for verification
    const verificationToken = await JWTService().accessToken(String(user._id));
    const backendUrl: string = config.getEnv("SERVER_URL");
    const verificationUrl = `${backendUrl}/verify-email.html?verificationUrl=${encodeURIComponent(
        backendUrl + "/api/user/verify?token=" + verificationToken
    )}`;
    const message = `Please click the link below to verify your email address: ${verificationUrl}`;
    const isMailSent = await sendMail(user?.email, "Email Verification", message);
    if (!isMailSent) return next(createHttpError(500, "Some Error Occurred While Sending Mail"));
    // make and store access and refresh token in cookies
    const accessToken = await JWTService().accessToken(String(user._id));
    const refreshToken = await JWTService().refreshToken(String(user._id));
    await JWTService().storeRefreshToken(String(refreshToken));
    res.cookie("accessToken", accessToken, accessTokenOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);
    return res.status(201).json({ message: "User created successfully" });
});
//--------------------
// VERIFY REGISTRATION
//--------------------
const verifyRegistration = TryCatch(async (req: Request<{}, {}, { token: string }>, res, next) => {
    const verificationToken: string = req.query?.token as string;
    if (!verificationToken) return next(createHttpError(400, "Please Provide Verification Token"));
    let decodedToken: any;
    try {
        decodedToken = await JWTService().verifyAccessToken(verificationToken);
    } catch (err) {
        return res.status(400).sendFile(path.join(__dirName, "../../../public/verificationFailed.html"));
    }
    // find user and verify token
    const user = await User.findById(decodedToken);
    if (!user)
        return res.status(400).sendFile(path.join(__dirName, "../../../public/verificationFailed.html"));
    // update user
    await user.save();
    res.status(200).sendFile(path.join(__dirName, "../../../public/verifiedSuccess.html"));
});
//----------
// login
//----------
const login = TryCatch(async (req, res, next) => {
    // get all body data
    const { email, password } = req.body;
    if (!email || !password) return next(createHttpError(400, "All fields are required!"));
    // match user
    const user = await User.findOne({ email });
    if (user) {
        // compare password
        const matchPwd = await bcrypt.compare(password, user.password);
        if (!matchPwd) return next(createHttpError(400, "Wrong username or password"));
        // make and store access and refresh token in cookies
        const accessToken = await JWTService().accessToken(String(user._id));
        const refreshToken = await JWTService().refreshToken(String(user._id));
        await JWTService().storeRefreshToken(String(refreshToken));
        res.cookie("accessToken", accessToken, accessTokenOptions);
        res.cookie("refreshToken", refreshToken, refreshTokenOptions);
        return res.status(200).json({
            success: true,
            message: "You are logged in successfully",
            data: user,
        });
    }
    return res.status(400).json({ success: false, message: "oops please signup" });
});
//---------------
// get my profile
//---------------
const getMyProfile = TryCatch(async (req, res, next) => {
    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (!user) return next(createHttpError(404, "User Not Found"));
    return res.status(200).json({ success: true, user });
});
//---------
// logout
//---------
const logout = TryCatch(async (req, res, next) => {
    await JWTService().removeRefreshToken(String(req?.cookies?.refreshToken));
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ success: true, message: "Logout Successfully" });
});
//-----------------
// FORGET PASSWORD
//----------------
const forgetPassword = TryCatch(async (req, res, next) => {
    const { email } = req.body;
    if (!email) return next(createHttpError(400, "Please Provide Email"));
    // find user
    const user = await User.findOne({ email });
    if (!user) return next(createHttpError(404, "Please Provide Correct Email"));
    // send mail
    const resetPasswordUrl = config.getEnv("RESET_PASSWORD_URL");
    const resetToken = await JWTService().accessToken(String(user._id));
    const message = `Your Reset Password Link: ${resetPasswordUrl}/${resetToken}`;
    const isMailSent = await sendMail(email, "Reset Password", message);
    if (!isMailSent) return next(createHttpError(500, "Some Error Occurred While Sending Mail"));
    res.status(200).json({
        success: true,
        message: "Reset Password Token sent to your email",
    });
});
//---------------
// RESET PASSWORD
//---------------
const resetPassword = TryCatch(async (req, res, next) => {
    const resetToken: string = req.query?.resetToken as string;
    const { newPassword } = req.body;
    if (!resetToken || !newPassword) return next(createHttpError(400, "Token and New Password are required"));
    let verifiedToken: any;
    try {
        verifiedToken = await JWTService().verifyAccessToken(resetToken);
    } catch (err) {
        return res.status(400).sendFile(path.join(__dirName, "../../public/verificationFailed.html"));
    }
    const user = await User.findById(verifiedToken).select("+password");
    if (!user) return next(createHttpError(404, "Invalid or Expired Token"));
    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    await user.save();
    res.status(200).json({ success: true, message: "Password Reset Successfully" });
});
//----------------------
// get new access token
//----------------------
const getNewAccessToken = TryCatch(async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return next(createHttpError(401, "Please Login Again"));
    let verifyToken: any;
    try {
        verifyToken = await JWTService().verifyRefreshToken(refreshToken);
    } catch (err) {
        return next(createHttpError(401, "Please Login Again"));
    }
    if (verifyToken) {
        const user = await User.findById(verifyToken._id);
        if (!user) return next(createHttpError(401, "Please Login Again"));
        const newAccessToken = await JWTService().accessToken(String(user._id));
        const newRefreshToken = await JWTService().refreshToken(String(user._id));
        // remove old Refresh Token and save new refresh token
        await Promise.all([
            JWTService().removeRefreshToken(String(refreshToken)),
            JWTService().storeRefreshToken(String(newRefreshToken)),
        ]);
        res.cookie("accessToken", newAccessToken, accessTokenOptions);
        res.cookie("refreshToken", newRefreshToken, refreshTokenOptions);
        res.status(200).json({ success: true, message: "New Authentication Created SuccessFully" });
    }
});

export {
    forgetPassword,
    login,
    logout,
    register,
    resetPassword,
    verifyRegistration,
    getNewAccessToken,
    getMyProfile,
};
