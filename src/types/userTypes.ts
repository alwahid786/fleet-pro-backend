interface UserTypes {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    address: string;
    password: string;
}
interface UserSchemaTypes extends UserTypes {
    _id: string;
    role: string;
    isVerified: boolean;
    subscription: {
        subscriberId: string;
        paid_sub: boolean;
    };
    image: { url: string; public_id: string };
    createdAt: Date;
    updatedAt: Date;
}

export { UserTypes, UserSchemaTypes };
