import http from "http";
import {
  homepage,
  handleQuote,
  handleReadSignals,
  handleRemoveTrash,
  handleExecuteScript,
  handleClock,
  handleRemoveSignal,
} from "./commonHandlers.js";

import url from "url";

// Initialize an HTTP server
const PORT = 3100;

const server = http.createServer((req, res) => {
  if (req.method === "GET") {
    const parsedUrl = url.parse(req.url);
    switch (parsedUrl.pathname) {
      case "/":
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(homepage("node.js"));
        break;

      case "/quote":
        handleQuote(req, res);
        break;

      case "/readSignals":
        handleReadSignals(req, res);
        break;

      case "/removeTrash":
        handleRemoveTrash(req, res);
        break;

      case "/printToConsole":
        handleExecuteScript(req, res);
        break;

      case "/clock":
        handleClock(req, res);
        break;

      case "/removeSignal":
        handleRemoveSignal(req, res);
        break;

      default:
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
    }
  } else if (req.method === "POST") {
    const parsedUrl = url.parse(req.url);
    switch (parsedUrl.pathname) {
      case "/readSignals":
        console.log("post readsignals");
        handleReadSignals(req, res);
        break;
    }
  } else {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Node.js server http://localhost:${PORT}`);
});
