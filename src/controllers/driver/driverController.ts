import { Request } from "express";
import { TryCatch } from "../../utils/tryCatch.js";
import { DriverTypes, OptionalDriverTypes } from "../../types/driverTypes.js";
import createHttpError from "http-errors";
import { getDataUri, removeFromCloudinary, uploadOnCloudinary } from "../../utils/cloudinary.js";
import { Driver } from "../../models/driverModel/driver.model.js";
import { isValidObjectId } from "mongoose";

//
// Create a Driver
//
const createNewDriver = TryCatch(async (req: Request<{}, {}, DriverTypes>, res, next) => {
    // get data and validate
    const { firstName, fleetNumber, lastName, licenseExpiry, phoneNumber } = req.body;
    const image: Express.Multer.File | undefined = req.file;
    if (!image) return next(createHttpError(400, "Image Not Provided!"));
    if (!firstName || !fleetNumber || !lastName || !licenseExpiry || !phoneNumber)
        return next(createHttpError(400, "All Required fields are Not Provided!"));

    // upload image in cloudinary
    const fileUrl = getDataUri(image);
    if (!fileUrl.content) return next(createHttpError(400, "Error While Making a Url of File"));
    const myCloud = await uploadOnCloudinary(fileUrl.content!, "drivers");
    if (!myCloud?.public_id || !myCloud?.secure_url)
        return next(createHttpError(400, "Error While Uploading Image on Cloudinary"));

    // create driver
    const driver = await Driver.create({
        firstName,
        fleetNumber,
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
//
// get all drivers
//
const getAllDrivers = TryCatch(async (req, res, next) => {
    const drivers = await Driver.find();
    if (!drivers) return next(createHttpError(400, "Error While Fetching Drivers"));
    res.status(200).json({ success: true, message: "Drivers Fetched Successfully", drivers });
});

//
// get single drive
//
const getSingleDriver = TryCatch(async (req, res, next) => {
    const { driverId } = req.params;
    if (!isValidObjectId(driverId)) return next(createHttpError(400, "Invalid Driver Id"));
    // get driver
    const driver = await Driver.findById(driverId);
    if (!driver) return next(createHttpError(404, "Driver Not Found"));
    res.status(200).json({ success: true, driver });
});

//
// update driver
//
const updateDriver = TryCatch(async (req: Request<any, {}, OptionalDriverTypes>, res, next) => {
    const { driverId } = req.params;
    if (!isValidObjectId(driverId)) return next(createHttpError(400, "Invalid Driver Id"));
    // get data and validate
    const { firstName, fleetNumber, lastName, licenseExpiry, phoneNumber } = req.body;
    console.log("req.body", req.body);
    const image: Express.Multer.File | undefined = req.file;
    if (!firstName && !fleetNumber && !lastName && !licenseExpiry && !phoneNumber && !image)
        return next(createHttpError(400, "Please add Something to Update"));

    // get driver
    const driver = await Driver.findById(driverId);
    if (!driver) return next(createHttpError(404, "Driver Not Found"));

    // update driver
    if (firstName) driver.firstName = firstName;
    if (lastName) driver.lastName = lastName;
    if (fleetNumber) driver.fleetNumber = fleetNumber;
    if (licenseExpiry) driver.licenseExpiry = licenseExpiry;
    if (phoneNumber) driver.phoneNumber = phoneNumber;
    if (image) {
        // remove old file
        if (driver?.image?.public_id) await removeFromCloudinary(driver.image.public_id);

        // add new file as a profile image
        const fileUrl = getDataUri(image);
        if (!fileUrl.content) return next(createHttpError(400, "Error While Making a Url of File"));
        const myCloud = await uploadOnCloudinary(fileUrl.content!, "drivers");
        if (!myCloud?.public_id || !myCloud?.secure_url)
            return next(createHttpError(400, "Error While Uploading Image on Cloudinary"));

        // update driver data with new image
        driver.image.url = myCloud.secure_url;
        driver.image.public_id = myCloud.public_id;
    }

    // save updated driver
    const updatedDriver = await driver.save();
    if (!updatedDriver) return next(createHttpError(400, "Error While Updating Driver"));
    res.status(200).json({ success: true, message: "Driver Updated Successfully", updatedDriver });
});

//
// delete driver
//
const deleteDriver = TryCatch(async (req, res, next) => {
    const { driverId } = req.params;
    if (!isValidObjectId(driverId)) return next(createHttpError(400, "Invalid Driver Id"));

    // get driver and delete
    const driver = await Driver.findByIdAndDelete(driverId);
    if (!driver) return next(createHttpError(404, "Driver Not Found"));

    // remove image from cloudinary
    if (driver?.image?.public_id) await removeFromCloudinary(driver.image.public_id);

    res.status(200).json({ success: true, message: "Driver Deleted Successfully" });
});

export { createNewDriver, getAllDrivers, updateDriver, deleteDriver, getSingleDriver };
