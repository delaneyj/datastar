import HyperExpress from "hyper-express";

import {
  homepage,
  handleQuote,
  handleReadSignals,
  handleRemoveTrash,
  handleExecuteScript,
  handleClock,
  handleRemoveSignal,
} from "./commonHandlers.js";

// Initialize HyperExpress server
const server = new HyperExpress.Server();
const PORT = 3102;

// Configure routes
server.get("/", (req, res) => {
  res.html(homepage("hyper-express"));
});

server.get("/quote", handleQuote);

server.get("/readSignals", handleReadSignals);

server.get("/removeTrash", handleRemoveTrash);

server.get("/printToConsole", handleExecuteScript);

server.get("/clock", handleClock);

server.get("/removeSignal", handleRemoveSignal);

// Start the server
server
  .listen(PORT)
  .then(() => {
    console.log(`HyperExpress server http://localhost:${PORT}`);
  })
  .catch((error) => {
    console.error("Error starting server:", error);
  });
