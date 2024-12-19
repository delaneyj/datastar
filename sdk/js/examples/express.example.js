import express from "express";
import { ServerSentEventGenerator } from "../index.js";

import {
  homepage,
  handleQuote,
  handleReadSignals,
  handleRemoveTrash,
  handleExecuteScript,
  handleClock,
  handleRemoveSignal,
} from "./commonHandlers.js";

const app = express();
const PORT = 3101;

// Middleware to parse incoming JSON bodies if needed
app.use(express.json());

app.get("/", (req, res) => {
  res.send(homepage("Express.js"));
});

app.get("/quote", handleQuote);

app.get("/readSignals", handleReadSignals);

app.get("/removeTrash", handleRemoveTrash);

app.get("/printToConsole", handleExecuteScript);

app.get("/clock", handleClock);

app.get("/removeSignal", handleRemoveSignal);

app.listen(PORT, () => {
  console.log(`Express.js server http://localhost:${PORT}`);
});
