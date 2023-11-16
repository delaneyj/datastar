## Cascading Selects

[Original HTMX Version](https://htmx.org/examples/value-select/)

## Demo
<div
    id="value_select"
    data-fetch-url="'/examples/value_select/data'"
    data-on-load="$$get"
>
     Replace me
</div>

## Explanation

In this example we show how to make the values in one select depend on the value selected in another select.

To begin we start with a default value for the make select: Audi. We render the model select for this make. We then have the make select trigger a GET to /models to retrieve the models options and target the models select.

Here is the code:
```html
<div>
    <label >Make</label>
    <select name="make" hx-get="/models" hx-target="#models" hx-indicator=".htmx-indicator">
      <option value="audi">Audi</option>
      <option value="toyota">Toyota</option>
      <option value="bmw">BMW</option>
    </select>
  </div>
  <div>
    <label>Model</label>
    <select id="models" name="model">
      <option value="a1">A1</option>
      ...
    </select>
</div>
```
When a request is made to the /models end point, we return the models for that make:
```html
<option value='325i'>325i</option>
<option value='325ix'>325ix</option>
<option value='X5'>X5</option>
```
And they become available in the model select.