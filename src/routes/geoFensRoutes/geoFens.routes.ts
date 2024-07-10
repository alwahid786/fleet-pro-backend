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
    // create geofence
    app.post("/api/geofence/create", auth, createGeoFence);

    // get edit delete geofence
    app.route("/api/geofence/single/:geoFenceId")
        .get(auth, getSingleGeoFence)
        .put(auth, updateSingleGeoFences)
        .delete(auth, deleteSingleGeoFence);

    // add truck and area geofence
    app.put("/api/geofence/add-truck/:geoFenceId", auth, addTruckAndArea);

    // get all geofences
    app.get("/api/geofence/all", auth, getAllGeoFences);
};
