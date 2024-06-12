import { Types } from "mongoose";

export interface TruckTypes {
    truckName: string;
    fleetNumber: number;
    plateNumber: number;
    deviceId: string;
    assignedTo: Types.ObjectId | null;
}
export interface SchemaTruckTypes extends TruckTypes {
    image: { url: string; public_id: string };
    assignedTruck: Types.ObjectId | null;
    ownerId: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export type OptionalTruckTypes = Partial<TruckTypes>;
