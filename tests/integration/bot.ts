import { token } from "./auth.json";
import logger from "./struct/Logger.js";
import TestClient from "./struct/TestClient.js";

const client = new TestClient();

if (process.argv.includes("start")) client.start(token);

process.on("unhandledRejection", err => logger.error("unhandledRejection", err));
