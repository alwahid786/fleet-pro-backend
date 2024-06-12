import bcrypt from "bcrypt";
import { Request } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import path from "node:path";
import { config } from "../../config/config.js";
import { __dirName } from "../../constants/costants.js";
import { Auth } from "../../models/authModel/auth.model.js";
import { JWTService } from "../../services/jwtToken.js";
import { sendMail } from "../../services/sendMail.js";
import { User } from "../../types/userTypes.js";
import { TryCatch } from "../../utils/tryCatch.js";

//
// register controller
//
const register = TryCatch(async (req: Request<{}, {}, User>, res, next) => {
    // get all body data
    const { email, password } = req.body;
    // validate user data
    if (!email || !password) return next(createHttpError(400, "All fields are required!"));
    // check user email is already exists
    const emailExists = await Auth.exists({ email });
    if (emailExists) return next(createHttpError(400, "This email is already taken"));
    // hash password using bcrypt
    const hashPassword = await bcrypt.hash(password, 10);
    // create user
    const user = await Auth.create({ email, password: hashPassword });
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
    // access token
    const accessToken = await JWTService().accessToken(String(user._id));
    // refresh token
    const refreshToken = await JWTService().accessToken(String(user._id));
    // store access token in database
    await JWTService().storeRefreshToken(String(accessToken));
    //store access token and refresh token in cookie
    res.cookie("accessToken", accessToken);
    res.cookie("refreshToken", refreshToken);
    return res.status(201).json({ message: "User created successfully" });
});
//
// VERIFY REGISTRATION
//
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
    const user = await Auth.findById(decodedToken);
    if (!user)
        return res.status(400).sendFile(path.join(__dirName, "../../../public/verificationFailed.html"));
    // update user
    await user.save();
    res.status(200).sendFile(path.join(__dirName, "../../../public/verifiedSuccess.html"));
});
//
// login
//
const login = TryCatch(async (req, res, next) => {
    // get all body data
    const { email, password } = req.body;
    // validate user data
    if (!email || !password) return next(createHttpError(400, "All fields are required!"));
    // match user
    const user = await Auth.findOne({ email });
    if (user) {
        // compare password
        const matchPwd = await bcrypt.compare(password, user.password);
        if (!matchPwd)
            return res.status(400).json({
                success: false,
                message: "Wrong username or password",
            });
        const token = await JWTService().accessToken(String(user._id));
        res.cookie("token", token);
        return res.status(200).json({
            success: true,
            message: "You are logged in successfully",
        });
    }
    return res.status(400).json({ success: false, message: "oops please signup" });
});
//
// logout
//
const logout = TryCatch(async (req, res, next) => {
    res.clearCookie("token");
    return res.status(200).json({ message: "You are logout", status: true });
});
//
// FORGET PASSWORD
//
const forgetPassword = TryCatch(async (req, res, next) => {
    const { email } = req.body;
    if (!email) return next(createHttpError(400, "Please Provide Email"));
    // find user
    const user = await Auth.findOne({ email });
    if (!user) return next(createHttpError(404, "Please Provide Correct Email"));
    await user.save();
    // send mail
    const frontendUrl = config.getEnv("FRONTEND_URL");
    const resetToken = await JWTService().accessToken(String(user._id));
    const message = `Your Reset Password Link: ${frontendUrl}/resetPassword?resetToken=${resetToken}`;
    const isMailSent = await sendMail(email, "Reset Password", message);
    if (!isMailSent) return next(createHttpError(500, "Some Error Occurred While Sending Mail"));
    res.status(200).json({
        success: true,
        message: "Reset Password Token sent to your email",
    });
});
//
// RESET PASSWORD
//
const resetPassword = TryCatch(async (req, res, next) => {
    const resetToken: string = req.query?.token as string;
    const { newPassword } = req.body;
    if (!resetToken || !newPassword) return next(createHttpError(400, "Token and New Password are required"));
    let verifiedToken: any;
    try {
        verifiedToken = await JWTService().verifyAccessToken(resetToken);
    } catch (err) {
        return res.status(400).sendFile(path.join(__dirName, "../../public/verificationFailed.html"));
    }
    const user = await Auth.findById(verifiedToken).select("+password");
    if (!user) return next(createHttpError(404, "Invalid or Expired Token"));
    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    await user.save();
    res.status(200).json({ success: true, message: "Password Reset Successfully" });
});

export { forgetPassword, login, logout, register, verifyRegistration, resetPassword };
