const express = require("express");
const { randomBytes } = require("crypto");

const app = express();
app.use(express.json());
app.use(express.static("../../library/dist"));
app.use(express.urlencoded({ extended: true }));

const target = "target";

function makeIndexPage() {
  return `<!doctype html>
<html>
<head>
    <title>Node/Express + Datastar Example</title>
    <script type="module" defer src="/datastar.js"></script>
</head>
<body>
    <h2>Node/Express + Datastar Example</h2>
    <main class="container" id="main" data-store="{input:'', output:'', show: true}">
        <input type="text" placeholder="Send to server..." data-model="input"/>
        <button data-on-click="$$get('/get')">Send State Roundtrip</button>
        <button data-on-click="$$get('/target')">Target HTML Element</button>
        <button data-on-click="$show=!$show">Toggle Feed</button>
        <div id="output" data-text="$output"></div>
        <div id="${target}"></div>
        <div data-show="$show">
            <span>Feed from server: </span>
            <span id="feed" data-on-load="$$get('/feed')"></span>
        </div>

        <h5>Datastar Store</h5>
        <pre data-text="JSON.stringify(ctx.store(),null,2)"></pre>
    </main>
</body>
</html>`;
}

const htmlify = (store) => JSON.stringify(store).replace(/"/g, "&quot;");

function datastarSetupSSE(res) {
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });
  res.flushHeaders();
}

function datastarSetupFragment(res, frag, shouldUpsertAttributes, end) {
  res.write("event: datastar-fragment\n");
  if (shouldUpsertAttributes) res.write("data: merge upsert_attributes\n");
  res.write(`data: fragment ${frag}\n\n`);
  if (end) res.end();
}

app.get("/", (req, res) => {
  res.send(makeIndexPage());
});

app.get("/get", (req, res) => {
  console.log("GET /get");
  datastarSetupSSE(res);
  const store = JSON.parse(req.query.datastar);
  console.log("store", store);
  store.output = `Your input: ${store.input}, is ${store.input.length} long.`;
  const frag = `<main id="main" data-store="${htmlify(store)}"></main>`;
  datastarSetupFragment(res, frag, true, true);
});

app.get("/target", (req, res) => {
  datastarSetupSSE(res);
  const today = new Date();
  const stamp = today.toDateString() + " " + today.toTimeString().split(" ")[0];
  const frag = `<div id="${target}"><b>${stamp}</b></div>`;
  datastarSetupFragment(res, frag, false, true);
});

app.get("/feed", async (req, res) => {
  datastarSetupSSE(res);
  while (res.writable) {
    const rand = randomBytes(8).toString("hex");
    const frag = `<span id="feed">${rand}</span>`;
    datastarSetupFragment(res, frag);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  res.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT} 🚀`);
});
