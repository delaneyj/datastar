# Getting Started

Datastar brings the functionality provided by libraries like [Alpine.js](https://alpinejs.dev/) (frontend reactivity) and [htmx](https://htmx.org/) (backend reactivity) together, into one cohesive solution. It's a lightweight, extensible framework that allows you to:

1. Manage state and build reactivity into your frontend using HTML attributes.
2. Modify the DOM and state by sending events from your backend.

With Datastar, you can build any UI that a full-stack framework like React, Vue.js or Svelte can, but with a much simpler, hypermedia-driven approach.

<div class="alert alert-info">
    <iconify-icon icon="simple-icons:rocket"></iconify-icon>
    <div>
        We're so confident that Datastar can be used as a JavaScript framework replacement that we challenge anyone to find a use-case for a web app that Datastar <em>cannot</em> realistically be used to build!
    </div>
</div>

## Installation

### Using a Script Tag

The quickest way to use Datastar is to include it in your HTML using a script tag hosted on a CDN.

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/gh/starfederation/datastar/bundles/datastar.js"
></script>
```

If you prefer to host the file yourself, download your own bundle using the [bundler](/bundler), then include it from the appropriate path.

```html
<script type="module" src="/path/to/datastar.js"></script>
```

### Using NPM

You can alternatively install Datastar via [npm](https://www.npmjs.com/package/@starfederation/datastar). We don't recommend this for most use-cases, as it requires a build step, but it can be useful for legacy frontend projects.

```bash
npm install @starfederation/datastar
```

## Data Attributes

At the core of Datastar are [`data-*`](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) attributes (hence the name). They allow you to add reactivity to your frontend in a declarative way, and to interact with your backend.

Datastar uses signals to manage state. You can think of signals as reactive variables that automatically track and propagate changes, from and to expressions. They can be created and modified using data attributes on the frontend or events sent from the backend. Don't worry if this sounds complicated; it will become clearer as we look at some examples.

### `data-bind`

Datastar provides us with a way to set up two-way data binding on an element using the [`data-bind`](/reference/attribute_plugins#data-bind) attribute, which can be placed on any HTML element on which data be be input or choices selected from (`input`, `textarea`, `select`, `checkbox` and `radio` elements, as well as web components).

```html
<input data-bind-input />
```

This creates a new signal called `input`, and binds it to the element's value. If either is changed, the other automatically updates.

An alternative syntax exists for `data-bind`, in which the value is used as the signal name. This can be useful depending on the templating language you are using.

```html
<input data-bind="input" />
```

### `data-text`

To see this in action, we can use the [`data-text`](/reference/attribute_plugins#data-text) attribute.

```html
<div data-text="input.value">
  I will get replaced with the contents of the input signal
</div>
```

<div class="flex items-start justify-between p-8 alert">
    <div class="flex flex-col gap-4">
        <div class="flex items-center">
            <div class="w-20">Input:</div>
            <input data-bind-input1 class="input input-bordered">
        </div>
        <div class="flex items-center">
            <div class="w-20">Output:</div>
            <div data-text="input1.value" class="output"></div>
        </div>
    </div>
</div>

This sets the text content of an element to the value of the signal `input`. The `.value` is required to denote the signal's *value* in the expression.

The value of the `data-text` attribute is an expression that is evaluated, meaning that we can use JavaScript in it.

```html
<div data-text="input.value.toUpperCase()">
  Will be replaced with the uppercase contents of the input signal
</div>
```

<div class="flex items-start justify-between p-8 alert">
    <div class="flex flex-col gap-4">
        <div class="flex items-center">
            <div class="w-20">Input:</div>
            <input data-bind-input2 class="input input-bordered">
        </div>
        <div class="flex items-center">
            <div class="w-20">Output:</div>
            <div data-text="input2.value.toUpperCase()" class="output"></div>
        </div>
    </div>
</div>

### `data-computed`

The [`data-computed`](/reference/attribute_plugins#data-computed) attribute creates a new signal that is computed based on an expression. The computed signal is read-only, and its value is automatically updated when any signals in the expression are updated.

```html
<div data-computed-repeated="input.value.repeat(2)">
  <input data-bind-input />
  <div data-text="repeated.value">
    Will be replaced with the contents of the repeated signal
  </div>
</div>
```

This results in the `repeated` signal's value always being equal to the value of the `input` signal repeated twice. Computed signals are useful for memoizing expressions containing other signals.

<div data-signals-input3="''" data-computed-repeated="input3.value.repeat(2)" class="flex items-start justify-between p-8 alert">
    <div class="flex flex-col gap-4">
        <div class="flex items-center">
            <div class="w-20">Input:</div>
            <input data-bind-input3 class="input input-bordered">
        </div>
        <div class="flex items-center">
            <div class="w-20">Output:</div>
            <div data-text="repeated.value" class="output"></div>
        </div>
    </div>
</div>

### `data-show`

The [`data-show`](/reference/attribute_plugins#data-show) attribute can be used to show or hide an element based on whether an expression evaluates to `true` or `false`.

```html
<button data-show="input.value != ''">Save</button>
```

This results in the button being visible only when the input is _not_ an empty string (this could also be written as `!input.value`).

<div class="flex items-start justify-between p-8 alert">
    <div class="flex flex-col gap-4">
        <div class="flex items-center">
            <div class="w-20">Input:</div>
            <input data-bind-input4 class="input input-bordered">
        </div>
        <div class="flex items-center">
            <div class="w-20">Output:</div>
            <div data-text="input4.value" class="output"></div>
        </div>
    </div>
    <button data-show="input4.value != ''" class="btn btn-primary">
        Save
    </button>
</div>

### `data-class`

The [`data-class`](/reference/attribute_plugins#data-class) attribute allows us to add or remove a class to or from an element based on an expression.

```html
<button data-class-hidden="input.value == ''">Save</button>
```

If the expression evaluates to `true`, the `hidden` class is added to the element; otherwise, it is removed.

<div class="flex items-start justify-between p-8 alert">
    <div class="flex flex-col gap-4">
        <div class="flex items-center">
            <div class="w-20">Input:</div>
            <input data-bind-input5 class="input input-bordered">
        </div>
        <div class="flex items-center">
            <div class="w-20">Output:</div>
            <div data-text="input5.value" class="output"></div>
        </div>
    </div>
    <button data-class-hidden="input5.value == ''" class="btn btn-primary">
        Save
    </button>
</div>

The `data-class` attribute can also be used to add or remove multiple classes from an element using a set of key-value pairs, where the keys represent class names and the values represent expressions.

```html
<button data-class="{hidden: input.value == '', bold: input.value == 1}">Save</button>
```

### `data-attributes`

The [`data-attributes`](/reference/attribute_plugins#data-attributes) attribute can be used to bind the value of any HTML attribute to an expression.

```html
<button data-attributes-disabled="input.value == ''">Save</button>
```

This results in a `disabled` attribute being given the value `true` whenever the input is an empty string.

<div class="flex items-start justify-between p-8 alert" data-signals-input6="''">
    <div class="flex flex-col gap-4">
        <div class="flex items-center">
            <div class="w-20">Input:</div>
            <input data-bind-input6 class="input input-bordered">
        </div>
        <div class="flex items-center">
            <div class="w-20">Output:</div>
            <div data-text="input6.value" class="output"></div>
        </div>
    </div>
    <button data-attributes-disabled="input6.value == ''" class="btn btn-primary">
        Save
    </button>
</div>

The `data-attributes` attribute can also be used to set the values of multiple attributes on an element using a set of key-value pairs, where the keys represent attribute names and the values represent expressions.

```html
<button data-attributes="{disabled: input.value == '', title: input.value}">Save</button>
```

### `data-signals`

So far, we've created signals on the fly using `data-bind` and `data-computed`. All signals are merged into a global set of signals that are accessible from anywhere in the DOM.

We can also create signals using the [`data-signals`](/reference/attribute_plugins#data-signals) attribute.

```html
<div data-signals-input="1"></div>
```

Using `data-signals` _merges_ one or more signals into the existing signals. Values defined later in the DOM tree override those defined earlier.

Signals are nestable using dot-notation, which can be useful for namespacing.

```html
<div data-signals-form.input="2"></div>
```

The `data-signals` attribute can also be used to merge multiple signals using a set of key-value pairs, where the keys represent signal names and the values represent expressions.

```html
<div data-signals="{input: 1, form: {input: 2}}"></div>
```

### `data-on`

The [`data-on`](/reference/attribute_plugins#data-on) attribute can be used to attach an event listener to an element and execute an expression whenever the event is triggered.

```html
<button data-on-click="input.value = ''">Reset</button>
```

This results in the `input` signal's value being set to an empty string whenever the button element is clicked. This can be used with any valid event name such as `data-on-keydown`, `data-on-mouseover`, etc.

<div class="flex items-start justify-between p-8 alert" >
    <div class="flex flex-col gap-4">
        <div class="flex items-center">
            <div class="w-20">Input:</div>
            <input data-bind-input7 class="input input-bordered">
        </div>
        <div class="flex items-center">
            <div class="w-20">Output:</div>
            <div data-text="input7.value" class="output"></div>
        </div>
    </div>
    <button data-on-click="input7.value = ''" class="btn btn-secondary">
        Reset
    </button>
</div>

So what else can we do now that we have declarative signals and expressions? Anything we want, really!

See if you can follow the code below based on what you've learned so far, _before_ trying the demo.

```html
<div
  data-signals="{response: '', answer: 'bread'}"
  data-computed-correct="response.value.toLowerCase() == answer.value"
>
  <div id="question">What do you put in a toaster?</div>
  <button data-on-click="response.value = prompt('Answer:') ?? ''">BUZZ</button>
  <div data-show="response.value != ''">
    You answered “<span data-text="response.value"></span>”.
    <span data-show="correct.value">That is correct ✅</span>
    <span data-show="!correct.value">
      The correct answer is “
      <span data-text="answer.value"></span>
      ” 🤷
    </span>
  </div>
</div>
```

<div data-signals="{response1: '', answer1: 'bread'}" data-computed-correct1="response1.value.toLowerCase() == answer1.value" class="flex items-start justify-between gap-4 p-8 alert">
    <div class="space-y-3">
        <div id="question1">
            What do you put in a toaster?
        </div>
        <div data-show="response1.value != ''">
            You answered “<span data-text="response1.value"></span>”.
            <span data-show="correct1.value">That is correct ✅</span>
            <span data-show="!correct1.value">
                The correct answer is “<span data-text="answer1.value"></span>” 🤷
            </span>
        </div>
    </div>
    <button data-on-click="response1.value = prompt('Answer:') ?? ''" class="btn btn-primary">
        BUZZ
    </button>
</div>

We've just scratched the surface of frontend reactivity. Now let's take a look at how we can bring the backend into play.

## Backend Setup

Datastar uses [Server-Sent Events](https://en.wikipedia.org/wiki/Server-sent_events) (SSE) to stream zero or more events from the web server to the browser. There's no special backend plumbing required to use SSE, just some syntax. Fortunately, SSE is straightforward and [provides us with some advantages](/essays/event_streams_all_the_way_down).

First, set up your backend in the language of your choice. Using one of the helper SDKs (available for [Go](https://github.com/starfederation/datastar/tree/main/sdk/go) and [PHP](https://github.com/starfederation/datastar/tree/main/sdk/php), with more on the way) will help you get up and running faster. We're going to use the SDKs in the examples below, which set the appropriate headers and format the events for us, but this is optional.

The following code would exist in a controller action endpoint in your backend.

!!!CODE_SNIPPET:getting_started/setup!!!

The `mergeFragments()` method merges the provided HTML fragment into the DOM, replacing the element with `id="question"`. An element with the ID `question` must _already_ exist in the DOM.

The `mergeSignals()` method merges the `response` and `answer` signals into the frontend signals.

With our backend in place, we can now use the `data-on-click` attribute to trigger the `sse()` action, which sends a `GET` request to the `/actions/quiz` endpoint on the server when a button is clicked.

```html
<div
  data-signals="{response: '', answer: ''}"
  data-computed-correct="response.value.toLowerCase() == answer.value"
>
  <div id="question"></div>
  <button data-on-click="sse('/actions/quiz')">Fetch a question</button>
  <button
    data-show="answer.value != ''"
    data-on-click="response.value = prompt('Answer:') ?? ''"
  >
    BUZZ
  </button>
  <div data-show="response.value != ''">
    You answered “<span data-text="response.value"></span>”.
    <span data-show="correct.value">That is correct ✅</span>
    <span data-show="!correct.value">
      The correct answer is “<span data-text="answer2.value"></span>” 🤷
    </span>
  </div>
</div>
```

Now when the `Fetch a question` button is clicked, the server will respond with an event to modify the `question` element in the DOM and an event to modify the `response` and `answer` signals. We're driving state from the backend!

<div data-signals="{response2: '', answer2: ''}" data-computed-correct2="response2.value.toLowerCase() == answer2.value" class="flex items-start justify-between gap-4 p-8 alert">
    <div class="pb-3 space-y-3">
        <div id="question2"></div>
        <div data-show="response2.value != ''">
            You answered “<span data-text="response2.value"></span>”.
            <span data-show="correct2.value">That is correct ✅</span>
            <span data-show="!correct2.value">
                The correct answer is “<span data-text="answer2.value"></span>” 🤷
            </span>
        </div>
        <button data-on-click="sse('/examples/quiz/data')" class="btn btn-secondary">
            Fetch a question
        </button>
    </div>
    <button data-show="answer2.value != ''" data-on-click="response2.value = prompt('Answer:') ?? ''" class="btn btn-primary">
        BUZZ
    </button>
</div>

### `data-indicator`

The [`data-indicator`](/reference/attribute_plugins#data-data-indicator) attribute sets the value of a signal to `true` while the request is in flight, otherwise `false`. We can use this signal to show a loading indicator, which may be desirable for slower responses.

```html
<div id="question"></div>
<div data-class-loading="fetching.value" class="indicator"></div>
<button
  data-on-click="sse('/actions/quiz')"
  data-indicator-fetching
>
  Fetch a question
</button>
```

<div data-signals="{response3: '', answer3: ''}" data-computed-correct3="response3.value.toLowerCase() == answer3.value" class="flex items-start justify-between gap-4 p-8 alert">
    <div class="pb-3 space-y-3">
        <div id="question3"></div>
        <div data-show="response3.value != ''">
            You answered “<span data-text="response3.value"></span>”.
            <span data-show="correct3.value">That is correct ✅</span>
            <span data-show="!correct3.value">
                The correct answer is “<span data-text="answer3.value"></span>” 🤷
            </span>
        </div>
        <div class="flex items-center gap-2">
            <button id="fetch-a-question" data-on-click="sse('/examples/quiz_slow/data')" data-indicator-fetching class="btn btn-secondary">
                Fetch a question
            </button>
            <div data-class-loading="fetching.value" class="indicator"></div>
        </div>
    </div>
    <button data-show="answer3.value != ''" data-on-click="response3.value = prompt('Answer:') ?? ''" class="btn btn-primary">
        BUZZ
    </button>
</div>

The `data-indicator` attribute can also be written with signal name in the attribute value.

```html
<button
  data-on-click="sse('/actions/quiz')"
  data-indicator="fetching"
>
```

We're not limited to just `GET` requests. We can send `GET`, `POST`, `PUT`, `PATCH` and `DELETE` requests, using the `method` option  of the `sse()` action.

Here's how we could send an answer to the server for processing, using a `POST` request.

```html
<button data-on-click="sse('/actions/quiz', {method: 'post'})">
  Submit answer
</button>
```

One of the benefits of using SSE is that we can send multiple events (HTML fragments, signal updates, etc.) in a single response.

!!!CODE_SNIPPET:getting_started/multiple_events!!!

## Actions

Actions in Datastar are helper functions that are available in `data-*` attributes and have the syntax `actionName()`. We already saw the `sse()` action above. Here are a few other common actions.

### `setAll()`

The `setAll()` action sets the values of multiple signals at once. It takes a path prefix that is used to match against signals, and a value to set them to, as arguments.

```html
<button data-on-click="setAll('form.', true)"></button>
```

This sets the values of all signals nested under the `form` signal to `true`, which could be useful for enabling input fields in a form.

```html
<input type="checkbox" data-bind-checkboxes.checkbox1 /> Checkbox 1
<input type="checkbox" data-bind-checkboxes.checkbox2 /> Checkbox 2
<input type="checkbox" data-bind-checkboxes.checkbox3 /> Checkbox 3
<button data-on-click="setAll('checkboxes.', true)">Check All</button>
```

<div class="flex flex-col items-start gap-2 p-8 alert">
    <div class="form-control">
        <label class="gap-2 cursor-pointer label">
            <span class="label-text">Checkbox 1</span>
            <input type="checkbox" data-bind-checkboxes1.checkbox1 class="toggle" />
        </label>
    </div>
    <div class="form-control">
        <label class="gap-2 cursor-pointer label">
            <span class="label-text">Checkbox 2</span>
            <input type="checkbox" data-bind-checkboxes1.checkbox2 class="toggle" />
        </label>
    </div>
    <div class="form-control">
        <label class="gap-2 cursor-pointer label">
            <span class="label-text">Checkbox 3</span>
            <input type="checkbox" data-bind-checkboxes1.checkbox3 class="toggle" />
        </label>
    </div>
    <button data-on-click="setAll('checkboxes1.', true)" class="mt-4 btn btn-secondary">
        Check All
    </button>
</div>

### `toggleAll()`

The `toggleAll()` action toggles the values of multiple signals at once. It takes a path prefix that is used to match against signals, as an argument.

```html
<button data-on-click="toggleAll('form.')"></button>
```

This toggles the values of all signals containing `form.` (to either `true` or `false`), which could be useful for toggling input fields in a form.

```html
<input type="checkbox" data-bind-checkboxes.checkbox1 /> Checkbox 1
<input type="checkbox" data-bind-checkboxes.checkbox2 /> Checkbox 2
<input type="checkbox" data-bind-checkboxes.checkbox3 /> Checkbox 3
<button data-on-click="toggleAll('checkboxes.')">Toggle All</button>
```

<div class="flex flex-col items-start gap-2 p-8 alert">
    <div class="form-control">
        <label class="gap-2 cursor-pointer label">
            <span class="label-text">Checkbox 1</span>
            <input type="checkbox" data-bind-checkboxes2.checkbox_1 class="toggle" />
        </label>
    </div>
    <div class="form-control">
        <label class="gap-2 cursor-pointer label">
            <span class="label-text">Checkbox 2</span>
            <input type="checkbox" data-bind-checkboxes2.checkbox_2 class="toggle" />
        </label>
    </div>
    <div class="form-control">
        <label class="gap-2 cursor-pointer label">
            <span class="label-text">Checkbox 3</span>
            <input type="checkbox" data-bind-checkboxes2.checkbox_3 class="toggle" />
        </label>
    </div>
    <button data-on-click="toggleAll('checkboxes2.')" class="mt-4 btn btn-secondary">
        Toggle All
    </button>
</div>

## A Quick Overview

Using [`data-*`](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) attributes, you can introduce reactive state to your frontend and access it anywhere in the DOM and in your backend. You can set up events that trigger requests to backend endpoints that respond with HTML fragment and signal updates.

- Bind element values to signals: `data-bind-foo`
- Set the text content of an element to an expression.: `data-text="foo.value"`
- Create a computed signal: `data-computed-foo="bar.value + 1"`
- Show or hide an element using an expression: `data-show="foo.value"`
- Modify the classes on an element: `data-class-bold="foo.value == 1"`
- Bind an expression to an HTML attribute: `data-attributes-disabled="foo.value == ''"`
- Merge signals into the signals: `data-signals-foo=""`
- Execute an expression on an event: `data-on-click="sse(/endpoint)"`
- Use signals to track in flight backend requests: `data-indicator-fetching`
- Replace the URL: `data-replace-url="'/page1'"`
- Persist all signals in local storage: `data-persist`
- Create a reference to an element: `data-ref-alert`
- Check for intersection with the viewport: `data-intersect="alert('visible')"`
- Scroll programmatically: `data-scroll-into-view`
- Interact with the [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API): `data-view-transition="slide"`

View the [attributes reference](/reference/attributes).