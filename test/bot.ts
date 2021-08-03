import TestClient from "./struct/TestClient";
const client = new TestClient();

import { token } from "./auth.json";
client.start(token);

process.on("unhandledRejection", err => console.error(err)); // eslint-disable-line no-console
