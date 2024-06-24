import { Types } from "mongoose";

export interface DriverTypes {
    firstName: string;
    lastName: string;
    licenseExpiry: Date;
    fleetNumber: number;
    phoneNumber: string;
    assignedTruck?: Types.ObjectId | null;
}
export interface SchemaDriverTypes extends DriverTypes {
    image: { url: string; public_id: string };
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
}

export type OptionalDriverTypes = Partial<DriverTypes>;
