import { NextFunction, Request, Response } from "express";
import { Device } from "../../models/deviceModel/device.model.js";
import { TryCatch } from "../../utils/tryCatch.js";
import { DeviceTypes } from "../../types/device.types.js";
import createHttpError from "http-errors";
import Sensor from "../../models/sensorModel/sensor.model.js";

// create device
// -------------
const createDevice = TryCatch(
    async (req: Request<{}, {}, DeviceTypes>, res: Response, next: NextFunction) => {
        const ownerId = req.user?._id;
        const { name, type, ip, uniqueId } = req.body;
        console.log(req.body);
        if (!name || !type || !ip || !uniqueId)
            return next(createHttpError.BadRequest("All fields are required"));
        await Device.create({ name, type, ip, uniqueId, ownerId });
        res.status(201).json({ success: true, message: "Device created successfully" });
    }
);

// get single device
// -----------------
const getSingleDevice = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = req.user?._id;
    const deviceId = req?.params?.deviceId;
    const device = await Device.findOne({ _id: deviceId, ownerId });
    if (!device) return next(createHttpError.NotFound("Device Not Found"));
    res.status(200).json({ success: true, data: device });
});

// update device
// -------------
const updateDevice = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const ownerId = req.user?._id;
    const deviceId = req?.params?.deviceId;
    const { name, type, ip, uniqueId } = req.body;
    if (!name && !type && !ip && !uniqueId) return next(createHttpError.BadRequest("Nothing For Update"));
    const device = await Device.findOne({ _id: deviceId, ownerId });
    if (!device) return next(createHttpError.NotFound("Device Not Found"));
    if (name) device.name = name;
    if (type) device.type = type;
    if (ip) device.ip = ip;
    if (uniqueId) device.uniqueId = uniqueId;
    await device.save();

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

// get device data by unique id
// -------------------------------
const getSingleDeviceLatestData = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { uniqueId } = req.query;
    const sensors = await Sensor.find({
        payload: { $regex: `\"uniqueId\": \"${uniqueId}\"` },
    });
    if (!sensors || sensors.length === 0) {
        return next(createHttpError.NotFound("Device Not Found"));
    }
    const parsedSensors = sensors.map((sensor: any) => {
        const parsedPayload = JSON.parse(sensor.payload);
        return {
            _id: sensor._id,
            topic: sensor.topic,
            payload: parsedPayload,
            timestamp: parsedPayload.timestamp,
        };
    });
    parsedSensors.sort((a: any, b: any) => b.timestamp - a.timestamp);
    const latestSensor = parsedSensors[0];
    res.status(200).json({ success: true, data: latestSensor });
});

export {
    createDevice,
    getSingleDevice,
    deleteDevice,
    getAllDevices,
    updateDevice,
    getSingleDeviceLatestData,
};
