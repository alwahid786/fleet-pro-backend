import {
    createDevice,
    deleteDevice,
    getAllDevices,
    updateDevice,
} from "../../controllers/device/deviceController.js";
import { auth } from "../../middlewares/auth.js";

const deviceRoutes = (app: any) => {
    // create new device
    app.post("/api/device/create", auth, createDevice);

    // update device and delete device
    app.route("/api/device/:deviceId").put(auth, updateDevice).delete(auth, deleteDevice);

    // get all devices
    app.get("/api/device/all", auth, getAllDevices);
};

export { deviceRoutes };
