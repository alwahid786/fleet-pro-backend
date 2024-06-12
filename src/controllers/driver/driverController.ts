import { Request } from "express";
import { TryCatch } from "../../utils/tryCatch.js";
import { DriverTypes } from "../../types/driverTypes.js";
import createHttpError from "http-errors";
import { getDataUri, uploadOnCloudinary } from "../../utils/cloudinary.js";
import { Driver } from "../../models/driverModel/driver.model.js";

//
// Create a Driver
//
const createNewDriver = TryCatch(async (req: Request<{}, {}, DriverTypes>, res, next) => {
    const { firstName, fleatNumber, lastName, licenseExpiry, phoneNumber } = req.body;

    const image = req.file;
    if (!image) return next(createHttpError(400, "Image Not Provided!"));

    if (!firstName || !fleatNumber || !lastName || !licenseExpiry || !phoneNumber) {
        return next(createHttpError(400, "All Required fields are Not Provided!"));
    }

    const fileUrl = getDataUri(image);
    if (!fileUrl.content) return next(createHttpError(400, "Error While Making a Url of File"));

    const myCloud = await uploadOnCloudinary(fileUrl.content!, "drivers");
    if (!myCloud?.public_id || !myCloud?.secure_url)
        return next(createHttpError(400, "Error While Uploading Image on Cloudinary"));

    const driver = await Driver.create({
        firstName,
        fleatNumber,
        lastName,
        licenseExpiry,
        phoneNumber,
        image: {
            url: myCloud.secure_url,
            public_id: myCloud.public_id,
        },
    });
    if (!driver) return next(createHttpError(400, "Error While Creating Driver"));
    res.status(201).json({ success: true, message: "Driver Created Successfully", driver });
});

export { createNewDriver };
