# Getting Started

## A Birds Eye View

If you are familiar with libraries like [HTMX](https://htmx.org/) or [AlpineJs](https://alpinejs.dev/); Datastar brings them together. This breaks down essentially to:

1. Send the current UI from your backend via HTML fragments like HTMX.
2. Manage client side state that wouldn't make sense to be managed by your backend like AlpineJS.

I've had [thoughts](/essays/why_another_framework) on both of these in the past. TLDR; While both libraries are great, I wanted to go in a different direction.

Datastar accomplishes both tasks in a unified manner and it's [tiny](https://bundlephobia.com/package/@sudodevnull/datastar).

## Installation

To get started you must first get a copy of Datastar. There are a few ways to do this.

**Remotely**

You can include it directly into your html using a script tag:

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@sudodevnull/datastar@PACKAGE_VERSION/dist/datastar.min.js"
  defer
></script>
```

**NPM**

For npm-style build systems, you can install Datastar via npm and then import this in your server file.

```bash
npm i @sudodevnull/datastar
```

**Copy Locally**

Here is a
<a href="https://cdn.jsdelivr.net/npm/@sudodevnull/datastar@PACKAGE_VERSION/dist/datastar.min.js">
minified</a> version of the library. If you want a version with source maps use [Module](https://cdn.jsdelivr.net/npm/@sudodevnull/datastar@PACKAGE_VERSION/dist/datastar.js) and the [Source Map](https://cdn.jsdelivr.net/npm/@sudodevnull/datastar@PACKAGE_VERSION/dist/datastar.js.map).

## A Quick Primer

Now let's get our feet wet. We'll walk through some ways to use Datastar with a quick example. For our example we'll just spin up an [Express](https://expressjs.com/en/starter/hello-world.html) server on Node. We'll have the server prepare a template for us when we first navigate to it.

You can copy the code below to get started. Don't worry, we've already installed Datastar for you using a [CDN](#remotely).

```js
const express = require("express");
const { randomBytes } = require("crypto");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const backendData = {};

function indexPage() {
  const indexPage = `
    <!doctype html><html>
      <head>
        <title>Node/Express + Datastar Example</title>
        <script type="module" defer src="https://cdn.jsdelivr.net/npm/@sudodevnull/datastar"></script></head>
      <body>
        <h2>Node/Express + Datastar Example</h2>
        <main class="container" id="main"></main>
      </body>
    </html>`;
  return indexPage;
}

app.get("/", (req, res) => {
  res.send(indexPage()).end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

We have basic server set up. Now let's get to the fun part. Let's add some Datastar functionality.

## Handling State

Let's start out with how Datastar handles state. Enter the [store](/reference/plugins_core#store) attribute.

Go ahead and add this as a data attribute to the `<main>` element:

```html
<main class="container" id="main" data-store='{ "input": "" }'></main>
```

This is the global store, if you make multiple stores they will actually merge into one store behind the scenes. If there are two fields with the same name, Datastar will resolve as last in wins.

The store is great and all but how can we use it? There are many ways. Let's check some of them out.

## Some Reactivity

If you had a keen eye, you noticed we put `input` as a field on our store. What's that about? Glad you asked! It's Datastar's way to sets up two-way data binding on an element. In our case this `input` element. Say hi to the [Model](/reference/plugins_attributes#model) attribute.

Stick this inside of your `<main>` element:

```html
<input type="text" placeholder="Type here!" data-model="input" />
```

This binds to a signal so our store can stay up to date with whatever is typed into this input. You can even nest your state like this `{"nested":{"label":"foo"}}` and use `data-model="nested.label"` or access it from the backend as needed.

Good stuff so far. How can we see this? We can check the changes locally using the [data-text](/reference/plugins_attributes#text) attribute.

Create a div in your `<main>` Element:

```html
<div data-text="$input"></div>
```

Sets the text content of an element to the value of the signal. Now check it out, client-side reactivity! We can have different types of state as well. We can even do fun stuff like `data-text="$value.toUpperCase()"`.

Speaking of which, let's do some more! Let's play hide 'n seek with the [data-show](/reference/plugins_visibility#show) attribute.

Add this to your store:

```js
{ input: "", show: false };
```

We can hide elements and show them without using JavaScript! How will we trigger this though?

## Events

We bring in the [On](/reference/plugins_attributes#on) attribute. This sets up an event listener on an element. In this example, we're using `data-on-click`. You will later see there are other `data-on` actions we can utilize. You can also do silly things like `data-on-click="console.log('hello world')"`.

Add this inside of your `<main>` element:

```html
<button data-on-click="$show=!$show">Toggle</button>
<div data-show="$show">
  <span>Hello From Datastar!</span>
</div>
```

So what else can we do? You can mess around and do some fun stuff with expressions. For instance, something like: `"$prompt=prompt('Enter something',$prompt);$confirm=confirm('Sure?');$confirm && $$get('/sure')"` is totally feasible.

Anyhow, we haven't really even scratched the surface. Let's keep going.

## Backend Plumbing

Now, let's send some data. To do this there's a few things we must understand, but it's all fun and easy, and you'll want to know it if you do not already!

Datastar uses [Server-Sent Events](https://en.wikipedia.org/wiki/Server-sent_events) or SSE. To use SSE, we have to set our backend up for it. Luckily it's extremely simple and [provides us with many advantages](/essays/event_streams_all_the_way_down).

Let's set things up. Copy the below code to your server.

Copy this to your server code:

```js
function setHeaders(res) {
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });
  res.flushHeaders();
}
```

`setHeaders` is simple a utility function we will use on our endpoints to set our headers to use SSE.

Copy this to your server code:

```js
function sendSSE({ res, frag, selector, mergeType, end }) {
  res.write("event: datastar-fragment\n");
  if (selector) res.write(`data: selector ${selector}\n`);
  if (mergeType?.length) res.write(`data: merge ${mergeType}\n`);
  res.write(`data: fragment ${frag}\n\n`);
  if (end) res.end();
}
```

We will use `sendSSE` as another utility function that will help us configure our response to fit SSE and Datastar formats. Let's check that out real quick.

## Stay In Formation

SSE messages are text-based and consist of one or more "events". Each event is separated by a pair (`\n\n`) of newline characters. An individual event consists of one or more lines of text, each followed by a newline character (`\n)`), and uses a simple key-value pair [format](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format).

For our Datastar example:

```
event: datastar-fragment // \n
id: 129618219840307262 // \n
data: merge morph // \n
data: fragment <div id="id">...</div> // \n\n

```

**NOTE** in the real message the comments and newlines wouldn't be visible

Each data message in the event is separated by a (`\n`) newline and each event is separated by a pair of (`\n\n`) newlines. If you notice that is what we are doing in `sendSSE` except with a little flavor added so we can tell Datastar what we want to do using [Datastar's format](/reference/plugins_backend#datastar-sse-event).

Now let's make our route.

Copy this to your server code:

```js
app.put("/put", (req, res) => {
  setHeaders(res);
  const { input } = req.body;
  backendData.input = input;
  const output = `Your input: ${input}, is ${input.length} long.`;
  let frag = `<div id="output">${output}</div>`;
  sendSSE({
    res,
    frag,
    end: true,
  });
});
```

So here you see we're setting our headers with `setHeaders`. We modify state that's stored specifically on the backend. This can be anything you want, like a database. Then we construct the response string much like HTMX and include the store attribute. We send the response with the `morph` merge type.

We need to make some changes now to reflect this.

Go ahead and modify your html.

Change this in your `<main>` element:

```html
<div data-text="$input"></div>
```

To this:

```html
<div id="output"></div>
```

Give ourselves a button to perform this action.

Add this to your `<main>` element:

```html
<button data-on-click="$$put('/put')">Send State</button>
```

...and give ourselves a place to show our new state on the client.

Voilà! Now if you check out what you've done, you'll find you're able to send data to your `/put` endpoint and respond with HTML updating the output `div`. Neato!

Let's retrieve the backend data we're now storing.

Add this to your server code:

```js
app.get("/get", (req, res) => {
  setHeaders(res);

  const output = `Backend State: ${JSON.stringify(backendData)}.`;
  let frag = `<div id="output2">${output}</div>`;

  sendSSE({
    res,
    frag,
    end: true,
  });
});
```

And this to your HTML:

```html
<button data-on-click="$$get('/get')">Get Backend State</button>
<div id="output2"></div>
```

We're now fetching state that's stored on the backend.

Let's try something for fun. In your `/get` route, change your call to `sendSSE` so that we do not immediately end the request connection.

Change your `sendSSE` function call in your `\get` route.

```js
sendSSE({
  ...
  end: false,
});
```

Add this to your `sendSSE` function below the first call:

```js
frag = `<div id="output3">Check this out!</div>;`;
sendSSE({
  res,
  frag,
  selector: "#main",
  mergeType: "prepend",
  end: true,
});
```

Now you'll notice you're sending two events in one call. That's because Datastar uses SSE. So using `prepend` we're able to prepend what we want to a target element. We do this using a `selector` and in our case this is the `<main>` element. Good stuff! You can check out all of Datastar's event types [here](/reference/plugins_backend).

There's one last thing we're going to do. Let's add a simple data feed upon loading the page.

Copy this to your server code:

```js
app.get("/feed", async (req, res) => {
  setHeaders(res);
  while (res.writable) {
    const rand = randomBytes(8).toString("hex");
    const frag = `<span id="feed">${rand}</span>`;
    sendSSE({
      res,
      frag,
      end: false,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  res.end();
});
```

Add this inside your `<main>` element:

```html
<div>
  <span>Feed from server: </span>
  <span id="feed" data-on-load="$$get('/feed')"></span>
</div>
```

I told you we would use another `data-on` action earlier and here it is. `data-on-load` will perform this request when the page loads. If you check things out now you should see a feed that updates using SSE upon loading. Cool!

Datastar supports all the verbs without requiring a `<form>` element: `GET, POST, PUT, PATCH, DELETE`.

So that concludes our primer! Check out the full code for our Node example [here](/examples/node).

If you're still here I imagine you want to know more. Let's define things a little better.

## A Better View

To be more precise, think of Datastar as an extension to HTML's [data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes). Using attributes, you can introduce state to your frontend, then access it anywhere in your DOM, or a backend of your choice. You can also set up events that trigger endpoints, then respond with HTML that targets fragments of your DOM.

- Declare global state: `data-store="{foo: ''}"`
- Link-up HTML elements to state slots: `data-model="foo"`
- Adjust HTML elements text content: `data-text="$foo"`
- Hookup other effects on your DOM to the state: `data-show="$foo"`
- Setup events using `data-on-click="$$get(/endpoint)"`
- Respond in HTML wrapped in SSE with a target element ID to update

It's that simple. To dive deeper check out some of the other links or just click below.
