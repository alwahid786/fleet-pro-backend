import path from "node:path";
import { fileURLToPath } from "url";

export const __dirName = fileURLToPath(import.meta.url);
export const __fileName = path.dirname(__dirName);

export const truckStatusEnum = ["notConnected", "connected"];
