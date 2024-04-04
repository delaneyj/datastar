"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const ssr_1 = require("@lit-labs/ssr");
const render_result_js_1 = require("@lit-labs/ssr/lib/render-result.js");
const express_1 = __importDefault(require("express"));
const html_minifier_terser_1 = require("html-minifier-terser");
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
const store = { answer: "fooo" };
const indexPage = () => (0, ssr_1.html)`
  <!doctype html>
  <html>
    <head>
      <title>Express + Datastar Example</title>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
      />
      <script
        type="module"
        defer
        src="https://cdn.jsdelivr.net/npm/@sudodevnull/datastar"
      ></script>
    </head>
    <body>
      ${containerFragment()}
    </body>
  </html>
`;
const containerFragment = () => (0, ssr_1.html)`<main
    class="container"
    id="app"
    data-store="${JSON.stringify(store)}"
  >
    <input
      type="text"
      placeholder="The Answer"
      data-model="answer"
    />
    <button
      class="outline"
      data-on-click="$$get('/random')"
    >
      Random
    </button>
    <button data-on-click="$$post('/update')">Update answer</button>
    <div
      id="ans"
      data-text="\`The answer is \${$answer}\`"
    ></div>
  </main>`;
app.get("/", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const rendered = yield tmplToString(indexPage());
    res.send(rendered);
  })
);
app.get("/random", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    console.log("Randomizing answer");
    store.answer = Math.random().toString();
    console.log("Updated answer:", store.answer);
    setupSSE(res);
    yield datastarFragment(res, containerFragment());
  })
);
app.post("/update", express_1.default.json(), (req, res) => {
  const currentAnswer = req.body.text;
  console.log("Updated answer:", currentAnswer);
  res.redirect("/");
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT} 🚀`);
});
function tmplToString(tmpl) {
  return __awaiter(this, void 0, void 0, function* () {
    const ssrResult = (0, ssr_1.render)(tmpl);
    const rendered = yield (0, render_result_js_1.collectResult)(ssrResult);
    const minified = yield (0, html_minifier_terser_1.minify)(rendered);
    console.log({ rendered, minified });
    return minified;
  });
}
function setupSSE(res) {
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  // res.on('close', () => {
  //   res.end()
  // })
}
function datastarFragment(res, tmpl) {
  return __awaiter(this, void 0, void 0, function* () {
    const ssrResult = yield tmplToString(tmpl);
    const contents = `event: datastar-fragment\ndata: fragment ${ssrResult}\n\n`;
    console.log("Sending:", contents);
    res.write(contents);
  });
}
function datastarUpdateStore(res) {
  return __awaiter(this, void 0, void 0, function* () {
    const rendered = yield tmplToString((0, ssr_1.html)`<main
      id="app"
      data-store="${JSON.stringify(store)}"
    ></main>`);
    res.write(`event: datastar-fragment\n`);
    res.write(`data: merge upsert_attributes\n`);
    res.write(`data: fragment ${rendered}\n\n`);
  });
}
//# sourceMappingURL=index.js.map
