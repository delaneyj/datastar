[Back to Two-Way Binding](/docs/included-plugins-ui-two-way-binding)

# Ref

![ref](/static/images/ref.webp)

```html
<canvas data-ref="canvas"></canvas>
```

Sometimes you need to get a reference to an element.  This allows you to do that.  The value of the attribute is the name of the variable you want to assign the element to.  You can then access it in another plugin like so:

```ts
const ctx = dataStack.refs.canvas.getContext('2d');
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 100, 100);
```



[Next Focus](/docs/included-plugins-ui-focus)
