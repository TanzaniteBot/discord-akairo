import { token } from "./src/auth.json";
import TestClient from "./src/struct/TestClient.js";
const client = new TestClient();

if (process.argv.includes("start")) client.start(token);

process.on("unhandledRejection", err => console.error(err)); // eslint-disable-line no-console