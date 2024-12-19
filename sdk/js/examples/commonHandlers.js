import { ServerSentEventGenerator } from "../index.js";

export let backendStore = {
  someBackendValue: "This is something",
};
export const homepage = (name = "") => {
  return `<html>
  <head>
    <title>${name} Datastar Test</title>
    <script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar@develop/bundles/datastar.js"></script>
  </head>
  <body>
    <h3>${name} Datastar Test</h3>
    <div data-signals="{theme: 'light', lastUpdate:'Never', xyz:'some signal'}">
      <h3>Long Lived SSE:</h3>
      <div id="clock" data-on-load="sse('/clock')">...Loading Clock</div>

      <h3>MergeSignals:</h3>
      <div>Last User Interaction:<span data-text="lastUpdate.value"></span></div>
      <h3>Merge Fragments</h3>
      <div id="quote">No Quote</div>
      <button data-on-click="sse('/quote')">MergeFragments</button>
      <h3>RemoveFragments</h3>
      <div id="trash">
        Remove me please!
        <button data-on-click="sse('/removeTrash')">RemoveFragments</button>
      </div>
      <h3>ExecuteScript</h3>
      <div>Print to Console</div>
      <button data-on-click="sse('/printToConsole')">ExecuteScript</button>

      <h3>ReadSignals</h3>
      <button data-on-click="sse('/readSignals')">ReadSignals</button>

      <h3>ReadSignals (post)</h3>
      <button data-on-click="sse('/readSignals', {method: 'post'})">ReadSignals (post)</button>


      <h3>RemoveSignals</h3>
      <div>Signal xyz:<span data-text="xyz.value"></span></div>
      <button data-on-click="sse('/removeSignal')">Test RemoveSignals: xyz</button>
    </div>
  </body>
  </html>`;
};

export const handleQuote = async (req, res) => {
  const sse = ServerSentEventGenerator.init(req, res);
  const qoutes = [
    "Any app that can be written in JavaScript, will eventually be written in JavaScript. - Jeff Atwood",
    "JavaScript is the world's most misunderstood programming language. - Douglas Crockford",
    "The strength of JavaScript is that you can do anything. The weakness is that you will. - Reg Braithwaite",
  ];
  const randomQuote = (arr) => arr[Math.floor(Math.random() * arr.length)];
  await sse.MergeFragments(`<div id="quote">${randomQuote(qoutes)}</div>`);
  await sse.MergeSignals({ lastUpdate: Date.now() });
  res.end();
};

export const handleReadSignals = async (req, res) => {
  const sse = ServerSentEventGenerator.init(req, res);
  backendStore = await sse.ReadSignals(backendStore);
  console.log("backendStore updated", backendStore);
  res.end();
};

export const handleRemoveTrash = async (req, res) => {
  const sse = ServerSentEventGenerator.init(req, res);
  await sse.RemoveFragments("#trash");
  await sse.MergeSignals({ lastUpdate: Date.now() });
  res.end();
};

export const handleExecuteScript = async (req, res) => {
  const sse = ServerSentEventGenerator.init(req, res);
  await sse.ExecuteScript(`console.log("Hello from the backend!")`);
  await sse.MergeSignals({ lastUpdate: Date.now() });
  res.end();
};

export const handleClock = async function (req, res) {
  const sse = ServerSentEventGenerator.init(req, res);
  setInterval(async () => {
    await sse.MergeFragments(`<div id="clock">${new Date()}</div>`);
  }, 1000);
};

export const handleRemoveSignal = async (req, res) => {
  const sse = ServerSentEventGenerator.init(req, res);
  await sse.RemoveSignals(["xyz"]);
};
