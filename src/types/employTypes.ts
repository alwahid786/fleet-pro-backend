export interface EmployTypes {
    ownerId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phoneNumber: string;
}

export interface EmploySchemaTypes extends EmployTypes {
    image: { url: string; public_id: string };
    createdAt: Date;
    updatedAt: Date;
}

export type OptionalEmployTypes = Partial<EmployTypes>;
