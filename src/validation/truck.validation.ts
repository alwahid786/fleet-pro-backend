import { body, query } from "express-validator";

const createTruckSanitizer = [
    body("truckName")
        .notEmpty()
        .withMessage("Truck name is required")
        .isString()
        .withMessage("Truck name must be a string"),
    body("fleetNumber")
        .notEmpty()
        .withMessage("Fleet number is required")
        .isInt()
        .withMessage("Fleet number must be a number"),
    body("plateNumber")
        .notEmpty()
        .withMessage("Plate number is required")
        .isInt()
        .withMessage("Plate number must be a number"),
    body("deviceId")
        .notEmpty()
        .withMessage("Device id is required")
        .isString()
        .withMessage("Device id must be a string"),
];

const updateTruckSanitizer = [
    query("truckId").isMongoId().withMessage("Invalid or Missing Truck Id"),
    body("truckName").optional().isString().withMessage("Truck name must be a string"),
    body("fleetNumber").optional().isInt().withMessage("Fleet number must be a number"),
    body("plateNumber").optional().isInt().withMessage("Plate number must be a number"),
    body("deviceId").optional().isString().withMessage("Device id must be a string"),
];

const singleTruckSanitizer = [query("truckId").isMongoId().withMessage("Invalid or Missing Truck Id")];
export { createTruckSanitizer, updateTruckSanitizer, singleTruckSanitizer };
