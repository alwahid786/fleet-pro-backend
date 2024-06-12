import cloudinary from "cloudinary";
import path from "node:path";
import DataURIParser from "datauri/parser.js";

export const getDataUri = (file: Express.Multer.File) => {
    const parser = new DataURIParser();
    const extName = path.extname(file.originalname).toString();
    return parser.format(extName, file.buffer);
};

export const configureCloudinary = async () => {
    try {
        cloudinary.v2.config({
            cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
            api_key: process.env.CLOUDINARY_CLIENT_KEY,
            api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
        });
        console.log("Cloudinary configured successfully");
    } catch (error) {
        console.error("Error configuring Cloudinary:", error);
    }
};
// UPLOAD FILE ON CLOUDINARY
// =========================
export const uploadOnCloudinary = async (fileName: string, subFolder: string) => {
    try {
        const response = await cloudinary.v2.uploader.upload(fileName, {
            resource_type: "image",
            folder: `fleat-backend/${subFolder}`,
        });
        console.log(`Image uploaded successfully on cloudinary`);
        return response;
    } catch (error) {
        console.error("Error occurred while uploading file on Cloudinary", error);
        return null;
    }
};

// REMOVE FILE FROM CLOUDINARY
// ===========================
export const removeFromCloudinary = async (fileName: string) => {
    try {
        const response = await cloudinary.v2.uploader.destroy(fileName, {
            resource_type: "image",
        });
        console.log(`Image deleted successfully from cloudinary`);
        return response;
    } catch (error) {
        console.error("Error occurred while removing file from Cloudinary", error);
        return null;
    }
};
