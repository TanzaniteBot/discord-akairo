import auth from "./auth.json" with { type: "json" };
import logger from "./struct/Logger.mjs";
import TestClient from "./struct/TestClient.mjs";

const { token } = auth;

const client = new TestClient();

if (process.argv.includes("start")) client.start(token);

process.on("unhandledRejection", err => logger.error("unhandledRejection", err));
