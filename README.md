![Version](https://img.shields.io/npm/v/@starfederation/datastar)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/%40starfederation%2Fdatastar)
![GitHub](https://img.shields.io/github/license/starfederation/datastar)
![Discord](https://img.shields.io/discord/1296224603642925098)

<p align="center"><img width="200" src="https://media.githubusercontent.com/media/starfederation/datastar/refs/heads/main/code/go/site/static/images/rocket.gif"></p>

# Datastar

[https://data-star.dev](https://data-star.dev)

### A real-time hypermedia framework.

Datastar helps you build real-time web applications with the simplicity of server-side rendering and the power of a full-stack SPA framework.

Here’s what frontend reactivity looks like using Datastar:

```html
<input data-model="input" type="text">
<div data-text="$input.toUpperCase()"></div>
<button data-on-click="$post('/endpoint')">Save</button>
```

Visit the [Datastar Website »](https://data-star.dev/)  

Join the [Discord Server »](https://discord.com/channels/1296224603642925098/1296224603642925102)

## Getting Started

### Installation

#### CDN

Include Datastar with a single ***12.36 KiB*** file and start adding reactivity to your frontend immediately. Write your backend in the language of your choice, and use the helper SDKs ( currently available for Go/PHP ) to get up and running even faster.  Now your can learn one API and transfer your knowledge to any language!

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar/datastar/bundles/datastar.js"></script>
```

Read the [Getting Started Guide »](https://data-star.dev/guide/getting_started)

#### Custom Bundles

You can build a custom bundle using the [Bundler »](https://data-star.dev/bundler)

Or manually add your own plugins to the core:

```html
<script type="importmap">
{
    "imports": {
      "datastar": "https://cdn.jsdelivr.net/gh/starfederation/datastar/datastar/bundles/datastar-core.js"
    }
}
</script>
<script type="module">
import {Datastar} from 'datastar'

Datastar.load(
    // I can make my own plugins!
)
</script>
```

#### NPM

```bash
npm install @starfederation/datastar
```

> [!IMPORTANT] 
> Only use the NPM package if you are using a bundler like Vite or if it’s part of a legacy project.

## Contributing

Read the [Contribution Guidelines »](CONTRIBUTING.md)
