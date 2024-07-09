import {
    addTruckAndArea,
    createGeoFence,
    deleteSingleGeoFence,
    getAllGeoFences,
    getSingleGeoFence,
    updateSingleGeoFences,
} from "../../controllers/geoFence/geoFenceController.js";
import { auth } from "../../middlewares/auth.js";

export const geoFneceRoutes = (app: any) => {
    app.post("/api/geofence/create", auth, createGeoFence);

    app.route("/api/geofence/single/:geoFenceId")
        .get(auth, getSingleGeoFence)
        .put(auth, updateSingleGeoFences)
        .delete(auth, deleteSingleGeoFence);

    app.put("/api/geofence/add-truck/:geoFenceId", auth, addTruckAndArea);

    app.get("/api/geofence/all", auth, getAllGeoFences);
};
