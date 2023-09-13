[Back to Bind Attribute](/docs/included-plugins-ui-bind-attribute)

# Two-Way Binding

![Events](/static/images/two-way-binding.gif)

```html
<input type="number" step="1" data-model="count"/>
```

Two way binding to any attribute of input, textarea, and select elements.  Works like `data-bind` but for values.  This ***must*** be used with a signal but you don't need to prefix it with `$` as it is implied.  When the value changes it will update the signal and when the signal changes it will update the value.


[Next Refs](/docs/included-plugins-ui-refs)
