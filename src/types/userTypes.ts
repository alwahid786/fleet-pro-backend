export interface UserTypes {
    email: string;
    password: string;
    role?: string;
}
export interface UserSchemaTypes extends UserTypes {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}
