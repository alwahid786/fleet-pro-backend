export interface DriverTypes {
    firstName: string;
    lastName: string;
    licenseExpiry: Date;
    fleatNumber: number;
    truckId: string;
    image: {
        url: string;
        public_id: string;
    };
    phoneNumber: string;
}
