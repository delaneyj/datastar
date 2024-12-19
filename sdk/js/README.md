![Version](https://img.shields.io/github/package-json/v/starfederation/datastar?filename=sdk/js/package.json)
![License](https://img.shields.io/github/license/starfederation/datastar)
![Stars](https://img.shields.io/github/stars/starfederation/datastar?style=flat)

<p align="center"><img width="200" src="https://data-star.dev/static/images/rocket.webp"></p>

# Datastar SDK

## Overview

The `datastar-sdk` is a backend JavaScript module designed to generate Server-Sent Events (SSE) for connected Datastar clients. It supports popular server frameworks such as Express.js, Node.js, and Hyper Express.js.

This SDK is engineered to integrate tightly with request and response objects of these backend frameworks, enabling efficient and reactive web application development.

### Key Features

- Real-time updates with Server-Sent Events tailored for Datastar clients
- Seamless integration with Express.js, Hyper Express.js, and Node HTTP

### Installation

Install the SDK via npm:

```bash
npm install datastar-sdk
```

### Quick Start Example with Express.js

Here's a straightforward example of setting up an Express.js server with the SDK:

```javascript
import express from 'express';
import { ServerSentEventGenerator } from 'datastar-sdk';

const app = express();
app.use(express.json());

// Define event handlers here

app.get('/messages', handleMessages);
app.get('/clock', handleClock);

const PORT = 3101;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

### Client Interaction Example

Here's a simple HTML page to interact with the server:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar/bundles/datastar.js"></script>
  <title>SSE Example</title>
</head>
<body>
  <h1>SSE Demo</h1>
  <div id="greeting-area">Greeting: <button onclick="sse('/messages')">Get Greeting</button></div>
  <div id="clock-area">Current Time: <button onclick="sse('/clock')">Start Clock</button></div>
</body>
</html>
```

### Available Functions

The `ServerSentEventGenerator` provides several functions to facilitate communication with connected Datastar clients using Server-Sent Events:

- **`init(request, response)`**: Initializes SSE communication with the specified request and response.

- **`_send(eventType, dataLines, sendOptions)`**: Sends a server-sent event (SSE) to the client. Options include setting an `eventId` and defining `retryDuration`.

- **`ReadSignals(signals)`**: Reads and merges signals based on HTTP methods with predefined signals, useful for parsing query or body data sent to the server.

- **`MergeFragments(fragments, options)`**: Sends a merge fragments event to update HTML content on the client. Options include `selector`, `mergeMode`, `settleDuration`, and `useViewTransition`.

- **`RemoveFragments(selector, options)`**: Dispatches events to remove HTML elements based on a CSS selector. Options can set a `settleDuration` or `useViewTransition`.

- **`MergeSignals(signals, options)`**: Sends a merge signals event to update or add client-side signals. Options may include `onlyIfMissing`.

- **`RemoveSignals(paths, options)`**: Sends an event to remove specific client-side signals identified by paths.

- **`ExecuteScript(script, options)`**: Directs the client to execute specified JavaScript code. Options can enable `autoRemove` of the script after execution.

This expanded set provides comprehensive functionality to build interactive web applications with real-time updates and dynamic HTML and signal management.
