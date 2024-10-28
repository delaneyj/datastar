## Shoelace Kitchensink

## Demo

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.15.1/cdn/themes/dark.css" />
<script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.15.1/cdn/shoelace-autoloader.js"></script>

<div
    id="shoelace_kitchensink"
    data-on-load="$$get('/examples/shoelace_kitchensink/data')"
>
</div>

## Explanation

[Shoelace](https://shoelace.style/) is a wonderful web component library. It is a great fit for Datastar, because it is designed to be used with plain HTML. All the Datastar built-in plugins just work with Shoelace.

Note this is using a `nested` data store just to verify that works. The store gets sent will get sent to the server as the whole context of the client should be available to the server.
