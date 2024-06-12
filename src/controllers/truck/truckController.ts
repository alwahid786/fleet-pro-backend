import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";
import { Driver } from "../../models/driverModel/driver.model.js";
import { Truck } from "../../models/truckModel/truck.model.js";
import { getDataUri, removeFromCloudinary, uploadOnCloudinary } from "../../utils/cloudinary.js";
import { TryCatch } from "../../utils/tryCatch.js";

//
// create new truck
//
const createNewTruck = TryCatch(async (req, res, next) => {
    const { truckName, fleetNumber, plateNumber, deviceId } = req.body;
    const image = req.file;
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
    res.status(201).json({ success: true, message: "Truck Created Successfully", truck });
});

//
// get all trucks
//
const getAllTrucks = TryCatch(async (req, res, next) => {
    const trucks = await Truck.find().populate("assignedTo", "firstName lastName");
    if (!trucks) return next(createHttpError(400, "Error While Fetching Trucks"));
    res.status(200).json({ success: true, trucks });
});

//
// update truck details
//
const updateTruck = TryCatch(async (req, res, next) => {
    const { truckId } = req.params;
    if (!isValidObjectId(truckId)) return next(createHttpError(400, "Invalid Truck Id"));

    // get data and validate
    const { truckName, fleetNumber, plateNumber, deviceId } = req.body;
    const image = req.file;
    if (!truckName && !fleetNumber && !plateNumber && !deviceId && !image)
        return next(createHttpError(400, "Not Any Field Is Provided!"));

    // get truck
    const truck = await Truck.findById(truckId);
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
// delete truck
//
const deleteTruck = TryCatch(async (req, res, next) => {
    const { truckId } = req.params;
    if (!isValidObjectId(truckId)) return next(createHttpError(400, "Invalid Truck Id"));

    // get truck and delete
    const truck = await Truck.findByIdAndDelete(truckId);
    if (!truck) return next(createHttpError(404, "Truck Not Found"));

    // remove image from cloudinary
    if (truck?.image?.public_id) await removeFromCloudinary(truck.image.public_id);
    res.status(200).json({ success: true, message: "Truck Deleted Successfully" });
});

//
// assign truck to driver
//
const assignTruckToDriver = TryCatch(async (req, res, next) => {
    // get data and validate
    const { truckId } = req.params;
    if (!isValidObjectId(truckId)) return next(createHttpError(400, "Invalid Truck Id"));
    const { driverId } = req.body;
    if (!isValidObjectId(driverId)) return next(createHttpError(400, "Invalid or Not Provided Driver Id"));

    // is driver and truck exist
    const [isDriver, isTruck] = await Promise.all([
        Driver.exists({ _id: driverId }),
        Truck.exists({ _id: truckId }),
    ]);
    if (!isDriver) return next(createHttpError(404, "Driver Not Exist"));
    if (!isTruck) return next(createHttpError(404, "Truck Not Exist"));

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
    // get data and validate
    const { truckId } = req.params;
    if (!isValidObjectId(truckId)) return next(createHttpError(400, "Invalid Truck Id"));

    // check is this truck assigned to any drive
    const isTruckAssigned = await Driver.exists({ assignedTruck: truckId });
    if (!isTruckAssigned) return next(createHttpError(404, "Truck Not Assigned to Any Driver"));

    // remove truck assignment from driver
    await Driver.findByIdAndUpdate(isTruckAssigned._id, { assignedTruck: null });
    // remove assignment from truck
    await Truck.findByIdAndUpdate(truckId, { assignedTo: null, status: "notConnected" });
    res.status(200).json({ success: true, message: "Truck Assignment Removed Successfully" });
});

export { assignTruckToDriver, createNewTruck, deleteTruck, getAllTrucks, removeTruckAssignment, updateTruck };