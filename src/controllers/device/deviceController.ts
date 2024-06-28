import { NextFunction, Request, Response } from "express";
import { Device } from "../../models/deviceModel/device.model.js";
import { TryCatch } from "../../utils/tryCatch.js";
import { DeviceTypes } from "../../types/device.types.js";
import createHttpError from "http-errors";

// create device
// -------------
const createDevice = TryCatch(
    async (req: Request<{}, {}, DeviceTypes>, res: Response, next: NextFunction) => {
        const ownerId = req.user?._id;
        const { name, type } = req.body;
        await Device.create({ name, type, ownerId });
        res.status(201).json({ success: true, message: "Device created successfully" });
    }
);

// update device
// -------------
const updateDevice = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = req.user?._id;
    const deviceId = req?.params?.deviceId;
    const { name, type } = req.body;
    const device = await Device.findOneAndUpdate({ _id: deviceId, ownerId }, { name, type }, { new: true });
    if (!device) return next(createHttpError.NotFound("Device Not Found"));
    res.status(200).json({ success: true, message: "Device updated successfully" });
});

// delete device
// -------------
const deleteDevice = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = req.user?._id;
    const deviceId = req?.params?.deviceId;
    const device = await Device.findOneAndDelete({ _id: deviceId, ownerId });
    if (!device) return next(createHttpError.NotFound("Device Not Found"));
    res.status(200).json({ success: true, message: "Device deleted successfully" });
});

// get all devices
// ---------------
const getAllDevices = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = req.user?._id;
    const devices = await Device.find({ ownerId }).populate("assignedTo");
    res.status(200).json({ success: true, data: devices });
});

export { createDevice, deleteDevice, getAllDevices, updateDevice };
