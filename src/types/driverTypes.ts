export interface DriverTypes {
    firstName: string;
    lastName: string;
    licenseExpiry: Date;
    fleatNumber: number;
    truckId: string;
    phoneNumber: string;
}

export type OptionalDriverTypes = Partial<DriverTypes>;
