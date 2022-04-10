import { token } from "./src/auth.json";
import logger from "./src/struct/Logger.js";
import TestClient from "./src/struct/TestClient.js";

const client = new TestClient();

if (process.argv.includes("start")) client.start(token);

process.on("unhandledRejection", err => logger.error("unhandledRejection", err));
