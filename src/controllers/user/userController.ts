import createHttpError from "http-errors";
import { User } from "../../models/userModel/user.model.js";
import { OptionalUserTypes, UserTypes } from "../../types/usersTypes.js";
import { TryCatch } from "../../utils/tryCatch.js";
import { Request } from "express";
import { getDataUri, removeFromCloudinary, uploadOnCloudinary } from "../../utils/cloudinary.js";
import { isValidObjectId } from "mongoose";

//
// create new user
//
const createNewUser = TryCatch(async (req: Request<{}, {}, UserTypes>, res, next) => {
    const ownerId = req.user?.ownerId;
    const { firstName, lastName, email, role, phoneNumber } = req.body;
    const image: Express.Multer.File | undefined = req.file;
    if (!image) return next(createHttpError(400, "Image Not Provided!"));
    if (!firstName || !lastName || !email || !role || !phoneNumber)
        return next(createHttpError(400, "All Required fields are Not Provided!"));

    // upload image on cloudinary
    const fileUrl = getDataUri(image);
    if (!fileUrl.content) return next(createHttpError(400, "Error While Making a Url of File"));
    const myCloud = await uploadOnCloudinary(fileUrl.content!, "users");
    if (!myCloud?.public_id || !myCloud?.secure_url)
        return next(createHttpError(400, "Error While Uploading Image on Cloudinary"));

    // create a user
    const user = await User.create({
        ownerId,
        firstName,
        lastName,
        email,
        role,
        phoneNumber,
        image: {
            url: myCloud.secure_url,
            public_id: myCloud.public_id,
        },
    });
    if (!user) return next(createHttpError(400, "Error While Creating User"));
    res.status(201).json({ success: true, message: "User Created Successfully" });
});

//
// get all users
//
const getAllUsers = TryCatch(async (req, res, next) => {
    const ownerId = req.user?.ownerId;

    const users = await User.find({ ownerId });
    if (!users) return next(createHttpError(400, "Error While Fetching Users"));
    res.status(200).json({ success: true, users });
});

//
// get single user
//
const getSingleUser = TryCatch(async (req, res, next) => {
    const ownerId = req.user?.ownerId;

    const { userId } = req.params;
    if (!isValidObjectId(userId)) return next(createHttpError(400, "Invalid User Id"));

    // get user
    const user = await User.findOne({ _id: userId, ownerId });
    if (!user) return next(createHttpError(404, "User Not Found"));
    res.status(200).json({ success: true, user });
});

//
// update single user
//
const updateSingleUser = TryCatch(async (req: Request<any, {}, OptionalUserTypes>, res, next) => {
    const ownerId = req.user?.ownerId;

    const { userId } = req.params;
    if (!isValidObjectId(userId)) return next(createHttpError(400, "Invalid User Id"));

    const { firstName, lastName, email, role, phoneNumber } = req.body;
    const image: Express.Multer.File | undefined = req.file;
    if (!firstName && !lastName && !email && !role && !phoneNumber && !image) {
        return next(createHttpError(400, "All Required fields are Not Provided!"));
    }

    // check user exist or not
    const user = await User.findOne({ _id: userId, ownerId });
    if (!user) return next(createHttpError(404, "User Not Found"));

    // now update fields according requirements
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (role) user.role = role;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (image) {
        // remove old file
        if (user?.image?.public_id) await removeFromCloudinary(user.image.public_id);
        // add new file as a profile image
        const fileUrl = getDataUri(image);
        if (!fileUrl.content) return next(createHttpError(400, "Error While Making a Url of File"));
        const myCloud = await uploadOnCloudinary(fileUrl.content!, "users");
        if (!myCloud?.public_id || !myCloud?.secure_url)
            return next(createHttpError(400, "Error While Uploading Image on Cloudinary"));
        user.image = { url: myCloud.secure_url, public_id: myCloud.public_id };
    }

    // update user
    const updatedUser = await user.save();
    if (!updatedUser) return next(createHttpError(400, "Error While Updating User"));
    res.status(200).json({ success: true, message: "User Updated Successfully" });
});

//
// delete single user
//
const deleteSingleUser = TryCatch(async (req, res, next) => {
    const ownerId = req.user?.ownerId;

    const { userId } = req.params;
    if (!isValidObjectId(userId)) return next(createHttpError(400, "Invalid User Id"));

    // check user exist or not
    const user = await User.findOneAndDelete({ _id: userId, ownerId }, { new: true });
    if (!user) return next(createHttpError(404, "User Not Found"));

    // remove image from cloudinary
    if (user?.image?.public_id) await removeFromCloudinary(user.image.public_id);

    res.status(200).json({ success: true, message: "User Deleted Successfully" });
});

export { createNewUser, getAllUsers, getSingleUser, updateSingleUser, deleteSingleUser };
