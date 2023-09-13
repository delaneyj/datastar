# Declarative UI


The web is basically a linked set of hypermedia.  However sometimes you really need state and local scripting to make things work.  Datastar is a hypermedia system that allows you to use the best of both worlds.  You can use the declarative nature of HTML and the power of Javascript to make your web apps.

The key concept that the core plugins are built is use the [data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) already built into HTML5.  It basically works like this:

```html
<div data-signal-count="0">
```

This is a normal HTML element with a `data-signal-count` attribute.  This is a special attribute that tells the `signal` plugin to create a signal called `count` with an initial value of `0`.  This is a very simple example but it shows how you can use HTML to define the state of your application.  This is a very powerful concept and allows you to build complex applications with very little code.

![Declarative UI](/static/images/bankruptcy.gif)

```html
<div data-shout.office="Bankruptcy!">
```
What does this mean?  It up to you and the plugins you decide to install.  Even if you don't install any plugins you HTML stays valid and inert.

All plugins work off data attributes, but as they are hooked onto the appropriate elements they can not only get access to the element, but the entire context of the page.  This allows you to build complex applications with very little code.  Alpine.js has some similar concepts but unfortunately has to monkey patch the DOM to make it work.  Also since `.dataset` is a native concept its easy to query ***ANY*** declarative information and even extend other plugins.

Note there is nothing out of the ordinary here, its just normal HTML5.  The key is this is kind of like Svelte's use of the [`$:`](https://learn.svelte.dev/tutorial/reactive-declarations) token for reactivity, we are hooking up Javascript to native HTML concepts so we don't break validators, proxies, etc.  We want extend the declarative native of the web; but we don't want to break it.

Next [Plugins](/docs/overview-plugins)