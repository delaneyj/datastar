# Getting Started

## Installation

### Remotely

```html
<script src="https://cdn.jsdelivr.net/npm/@sudodevnull/datastar"></script>
```

### Locally

```bash
npm i @sudodevnull/datastar
```

Think of Datastar as an extension to HTML [data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes). Using attributes, you can introduce state to your frontend, then access it anywhere in your DOM, or a backend of your choice. You can also setup events that trigger endpoints, then respond with HTML that targets fragments of your DOM.

- Declare global state using `data-store = "{foo: ''}"`
- Link-up HTML elements to state slots: `data-model = "foo"`
- Adjust HTML elements text content: `data-text = "$foo"`
- Hookup other effects on your DOM to the state: `data-show= "$foo"`
- Setup events using data-on-load or data-on-click = `"$$get(/endpoint)"`
- Respond in HTML wrapped in SSE with a target element ID to update

## Example backends

### Node.js

```js
const express = require("express");
const { randomBytes } = require("crypto");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const htmlify = (store) => JSON.stringify(store).replace(/"/g, "&quot;");
const target = "target";

function makeIndexPage() {
  const store = { input: "", output: "", show: true };
  const indexPage = `
<!doctype html>
<html>
  <head>
    <title>Node/Express + Datastar Example</title>
    <script type="module" defer src="https://cdn.jsdelivr.net/npm/@sudodevnull/datastar"></script>
  </head>
  <body>
    <h2>Node/Express + Datastar Example</h2>
    <main class="container" id="main" data-store="${htmlify(store)}">
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
    </main>
  </body>
</html>`;
  return indexPage;
}

function datastarSetupSSE(res) {
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });
  res.flushHeaders();
}

function datastarSetupFragment(res, frag, merge, end) {
  res.write("event: datastar-fragment\n");
  if (merge) res.write("data: merge upsert_attributes\n");
  res.write(`data: fragment ${frag}\n\n`);
  if (end) res.end();
}

app.get("/", (req, res) => {
  res.send(makeIndexPage());
});

app.get("/get", (req, res) => {
  datastarSetupSSE(res);
  const store = JSON.parse(req.query.datastar);
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
```

### Python

```python
import os, json, time, secrets, uvicorn
from starlette.applications import Starlette
from starlette.responses import HTMLResponse, StreamingResponse

app = Starlette()
target = 'target'

def htmlify(store):
    return json.dumps(store).replace('"', '&quot;')

def send_index():
    store = {'input': '', 'output': '', 'show': True}
    index_page = f'''
<!doctype html>
<html>
  <head>
    <title>Python + Datastar Example</title>
    <script type="module" defer src="https://cdn.jsdelivr.net/npm/@sudodevnull/datastar"></script>
  </head>
  <body>
    <h2>Python + Datastar Example</h2>
    <main class="container" id="main" data-store="{htmlify(store)}">
      <input type="text" placeholder="Send to server..." data-model="input"/>
      <button data-on-click="$$get('/get')">Send State Roundtrip</button>
      <button data-on-click="$$get('/target')">Target HTML Element</button>
      <button data-on-click="$show=!$show">Toggle Feed</button>
      <div id="output" data-text="$output"></div>
      <div id="{target}"></div>
      <div data-show="$show">
        <span>Feed from server: </span>
        <span id="feed" data-on-load="$$get('/feed')"></span>
      </div>
    </main>
  </body>
</html>
'''
    return HTMLResponse(index_page)

def send_fragment(frag, merge=False):
    yield 'event: datastar-fragment\n'
    if merge:
        yield 'data: merge upsert_attributes\n'
    yield f'data: fragment {frag}\n\n'

def send_stream():
    while True:
        rand = secrets.token_hex(8)
        frag = f'<span id="feed">{rand}</span>'
        yield from send_fragment(frag)
        time.sleep(1)

@app.route('/')
async def homepage(request):
    return send_index()

@app.route('/get')
async def get_data(request):
    store = json.loads(dict(request.query_params)['datastar'])
    store['output'] = f"Your input: {store['input']}, is {len(store['input'])} long."
    frag = f'<main id="main" data-store="{htmlify(store)}"></main>'
    return StreamingResponse(send_fragment(frag, True), media_type='text/event-stream')

@app.route('/target')
async def target_element(request):
    today = time.strftime("%Y-%m-%d %H:%M:%S")
    frag = f'<div id="target"><b>{today}</b></div>'
    return StreamingResponse(send_fragment(frag), media_type='text/event-stream')

@app.route('/feed')
async def feed(request):
    return StreamingResponse(send_stream(), media_type='text/event-stream')

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=int(os.environ.get('PORT', 3000)))
```

## FAQ

**Q: Wait, why wrap in SSE? I don’t know about SSE.**

> A: SSE is like a GET, no library is needed. See the Node.js or Python examples above. SSE will give you more power later.

**Q: What other frontend syntax can I use?**

> A: Try `data-on-click="console.log('hello world')"` or `data-text="$value.toUpperCase()"` or `data-focus=""` on an element.

**Q: When you say frontend expressions, you really mean full expressions?**

> A: Yes, like: `"$prompt=prompt('Enter something'`,`$prompt);$confirm=confirm('Sure?');$confirm && $$get('/sure')"`.

**Q: I saw GET above, where’s the rest?**

> A: You can have all the verbs: get, post, put, patch, and delete.

**Q: How can I get fancy with how I target my DOM?**

> A: Hit the inner or outer, prepend or append the children, go before or after or delete an element, or upsert attributes.

**Q: Can I set a computed value on my state as a new state to use?**

> A: Use data-bind-something="your expression" so that you can use $something anywhere you want.

**Q: Can I nest my state slots?**

> A: Yes, for `{"nested":{"label":"foo"}}` use `data-model="nested.label"` or access it from the backend as needed.

## Why another framework?

Javascript frameworks are a dime a dozen. So why did we create another one? The answer is simple: avoid writing any JavaScript for the majority of use cases. The key value of the browser and web is the declarative nature of hypermedia. It just got buried.

```html
<div class="container">
  <img src="foo.img" />
</div>
```

Web development has become a technical occultism activity, in which the focus is on JavaScript and the capabilities of making HTML content dynamic instead of making a better job of delivering HTML. This JavaScript religion has led to the rise of frontend frameworks such as React, Vue, Svelte, Solid, etc. In turn those were not enough for full application and progress led the industry to full-stack JavaScript frameworks like Next.js, Nuxt, Svelte and Solid Start. Once you need a framework for reactivity it makes sense to embrace it in the backend too for consistency.

In reality almost all frameworks come down to updating the DOM as fast and as simply as possible with some effort around improving developer experience.

## Philosophy

- **Be declarative**
- **Use signals**
- **Supply a set of plugins that handle 99% of problems**

Datastar started as just a plugin framework but found that by having no overlap in features, it was possible to replace any SPA framework and even hypermedia focused libraries like HTMX while being much smaller and _(we think)_ easier to use.

With Datastar, even if you have never coded before, with a few examples, you can easily create high interconnected web assets. It doesn't matter if you are a making a user interface for bank or a simple blog. The approach is simplicity through declarative HTML.

If Datastar doesn't match your needs, you still might be interested in using it as originally intended [and write your own library](https://github.com/delaneyj/datastar/tree/main/library/src/lib/plugins).
