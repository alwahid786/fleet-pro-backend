import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";
import { Driver } from "../../models/driverModel/driver.model.js";
import { Truck } from "../../models/truckModel/truck.model.js";
import { getDataUri, removeFromCloudinary, uploadOnCloudinary } from "../../utils/cloudinary.js";
import { TryCatch } from "../../utils/tryCatch.js";
import { OptionalTruckTypes, TruckTypes } from "../../types/truckTypes.js";
import { Request } from "express";

//
// create new truck
//
const createNewTruck = TryCatch(async (req: Request<{}, {}, TruckTypes>, res, next) => {
    const ownerId = req.user?.ownerId;
    if (!ownerId) return next(createHttpError(400, "Please Login to create a Driver"));

    // get data and validate
    const { truckName, fleetNumber, plateNumber, deviceId } = req.body;
    const image: Express.Multer.File | undefined = req.file;
    if (!image) return next(createHttpError(400, "Image Not Provided!"));
    if (!truckName || !fleetNumber || !plateNumber || !deviceId)
        return next(createHttpError(400, "All Required fields are Not Provided!"));

    // upload image in cloudinary
    const fileUrl = getDataUri(image);
    if (!fileUrl.content) return next(createHttpError(400, "Error While Making a Url of File"));
    const myCloud = await uploadOnCloudinary(fileUrl.content!, "trucks");
    if (!myCloud?.public_id || !myCloud?.secure_url)
        return next(createHttpError(400, "Error While Uploading Image on Cloudinary"));

    // create truck
    const truck = await Truck.create({
        ownerId,
        truckName,
        fleetNumber,
        plateNumber,
        deviceId,
        image: {
            url: myCloud.secure_url,
            public_id: myCloud.public_id,
        },
    });
    if (!truck) return next(createHttpError(400, "Error While Creating Truck"));
    res.status(201).json({ success: true, message: "Truck Created Successfully" });
});

//
// get all trucks
//
const getAllTrucks = TryCatch(async (req, res, next) => {
    const ownerId = req.user?.ownerId;
    if (!ownerId) return next(createHttpError(400, "Please Login to create a Driver"));

    const trucks = await Truck.find({ ownerId }).populate("assignedTo", "firstName lastName");
    if (!trucks) return next(createHttpError(400, "Error While Fetching Trucks"));
    res.status(200).json({ success: true, trucks });
});

//
// update single truck
//
const updateTruck = TryCatch(async (req: Request<any, {}, OptionalTruckTypes>, res, next) => {
    const ownerId = req.user?.ownerId;

    const { truckId } = req.params;
    if (!isValidObjectId(truckId)) return next(createHttpError(400, "Invalid Truck Id"));

    // get data and validate
    const { truckName, fleetNumber, plateNumber, deviceId } = req.body;
    const image: Express.Multer.File | undefined = req.file;
    if (!truckName && !fleetNumber && !plateNumber && !deviceId && !image)
        return next(createHttpError(400, "Not Any Field Is Provided!"));

    // get truck
    const truck = await Truck.findOne({ _id: truckId, ownerId });
    if (!truck) return next(createHttpError(404, "Truck Not Found"));

    // update truck fields
    if (truckName) truck.truckName = truckName;
    if (fleetNumber) truck.fleetNumber = fleetNumber;
    if (plateNumber) truck.plateNumber = plateNumber;
    if (deviceId) truck.deviceId = deviceId;
    if (image) {
        // remove old image from cloudinary
        if (truck.image?.public_id) await removeFromCloudinary(truck.image.public_id);

        // upload new image in cloudinary
        const fileUrl = getDataUri(image);
        if (!fileUrl.content) return next(createHttpError(400, "Error While Making a Url of File"));
        const myCloud = await uploadOnCloudinary(fileUrl.content!, "trucks");
        if (!myCloud?.public_id || !myCloud?.secure_url)
            return next(createHttpError(400, "Error While Uploading Image on Cloudinary"));
        truck.image.url = myCloud.secure_url;
        truck.image.public_id = myCloud.public_id;
    }

    // update user and send response
    await truck.save();
    res.status(200).json({ success: true, message: "Truck Updated Successfully" });
});

//
// get single truck
//
const getSingleTruck = TryCatch(async (req, res, next) => {
    const ownerId = req.user?.ownerId;
    const { truckId } = req.params;
    if (!isValidObjectId(truckId)) return next(createHttpError(400, "Invalid Truck Id"));
    // get truck
    const truck = await Truck.findOne({ _id: truckId, ownerId }).populate("assignedTo", "firstName lastName");
    if (!truck) return next(createHttpError(404, "Truck Not Found"));
    res.status(200).json({ success: true, truck });
});

//
// delete truck
//
const deleteTruck = TryCatch(async (req, res, next) => {
    const ownerId = req.user?.ownerId;
    const { truckId } = req.params;
    if (!isValidObjectId(truckId)) return next(createHttpError(400, "Invalid Truck Id"));

    // get truck and delete
    const truck = await Truck.findOneAndDelete({ _id: truckId, ownerId });
    if (!truck) return next(createHttpError(404, "Truck Not Found"));

    // remove image from cloudinary
    if (truck?.image?.public_id) await removeFromCloudinary(truck.image.public_id);
    res.status(200).json({ success: true, message: "Truck Deleted Successfully" });
});

//
// assign truck to driver
//
const assignTruckToDriver = TryCatch(async (req, res, next) => {
    const ownerId = req.user?.ownerId;
    // get data and validate
    const { truckId } = req.params;
    if (!isValidObjectId(truckId)) return next(createHttpError(400, "Invalid Truck Id"));
    const { driverId } = req.body;
    if (!isValidObjectId(driverId)) return next(createHttpError(400, "Invalid or Not Provided Driver Id"));

    // is driver and truck exist
    const [isDriver, isTruck] = await Promise.all([
        Driver.exists({ _id: driverId, ownerId }),
        Truck.exists({ _id: truckId, ownerId }),
    ]);
    if (!isDriver) return next(createHttpError(404, "Driver Not Exist in Your Account"));
    if (!isTruck) return next(createHttpError(404, "Truck Not Exist in Your Account"));

    // check is this truck assigned to any drive
    const isTruckAssigned = await Driver.exists({ assignedTruck: truckId });
    if (isTruckAssigned) return next(createHttpError(400, "Truck Already Assigned to Another Driver"));

    // update driver and truck
    const [truck, driver] = await Promise.all([
        Truck.findByIdAndUpdate(truckId, { assignedTo: isDriver._id, status: "connected" }, { new: true }),
        Driver.findByIdAndUpdate(driverId, { assignedTruck: isTruck._id }, { new: true }),
    ]);
    if (!truck || !driver) return next(createHttpError(400, "Error While Assigning Truck to Driver"));

    res.status(200).json({ success: true, message: "Truck Assigned Successfully" });
});

//
// remove assignment from driver
//
const removeTruckAssignment = TryCatch(async (req, res, next) => {
    const ownerId = req.user?.ownerId;
    // get data and validate
    const { truckId } = req.params;
    if (!isValidObjectId(truckId)) return next(createHttpError(400, "Invalid Truck Id"));

    // check is this truck assigned to any drive
    const isTruckAssigned = await Driver.exists({ assignedTruck: truckId, ownerId });
    if (!isTruckAssigned) return next(createHttpError(404, "Truck Not Assigned to Any Driver"));

    // remove truck assignment from driver
    await Driver.findByIdAndUpdate(isTruckAssigned._id, { assignedTruck: null });
    // remove assignment from truck
    await Truck.findByIdAndUpdate(truckId, { assignedTo: null, status: "notConnected" });
    res.status(200).json({ success: true, message: "Truck Assignment Removed Successfully" });
});

export {
    assignTruckToDriver,
    createNewTruck,
    deleteTruck,
    getAllTrucks,
    removeTruckAssignment,
    updateTruck,
    getSingleTruck,
};
