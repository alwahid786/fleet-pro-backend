export interface UserTypes {
    ownerId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phoneNumber: string;
}

export interface UserSchemaTypes extends UserTypes {
    image: { url: string; public_id: string };
    createdAt: Date;
    updatedAt: Date;
}

export type OptionalUserTypes = Partial<UserTypes>;
