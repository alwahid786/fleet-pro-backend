import { body, query } from "express-validator";

const createDriverSanitizer = [
    body("firstName")
        .notEmpty()
        .withMessage("First name is required")
        .isString()
        .withMessage("First name must be a string"),
    body("lastName")
        .notEmpty()
        .withMessage("Last name is required")
        .isString()
        .withMessage("Last name must be a string"),
    body("phoneNumber")
        .notEmpty()
        .withMessage("Phone number is required")
        .isString()
        .withMessage("Phone number must be a string"),
    body("fleetNumber")
        .notEmpty()
        .withMessage("Fleet number is required")
        .isInt()
        .withMessage("Fleet number must be a number"),
    body("licenseExpiry")
        .notEmpty()
        .withMessage("License expiry is required")
        .isDate()
        .withMessage("License expiry must be a date"),
];

const updateDriverSanitizer = [
    body("firstName").optional().isString().withMessage("First name must be a string"),
    body("lastName").optional().isString().withMessage("Last name must be a string"),
    body("phoneNumber").optional().isString().withMessage("Phone number must be a string"),
    body("fleetNumber").optional().isInt().withMessage("Fleet number must be a number"),
    body("licenseExpiry").optional().isDate().withMessage("License expiry must be a date"),
    body("assignedTruck").optional().isMongoId().withMessage("Assigned truck must be a valid truck id"),
    body("removeAssignedTruck").optional().isMongoId().withMessage("Assigned truck must be a valid truck id"),
];

const singleDriverSanitizer = [query("driverId").isMongoId().withMessage("Invalid Driver Id")];

export { createDriverSanitizer, updateDriverSanitizer, singleDriverSanitizer };
