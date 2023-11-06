## Click to Load

[Original HTMX Version](https://htmx.org/examples/click-to-load/)

## Demo
<div
    id="click_to_load"
    data-fetch-url="'/examples/click_to_load/data'"
    data-on-load="$$get"
>
     Replace me
</div>

## Explanation
This example shows how to implement click-to-load the next page in a table of data. The crux of the demo is the final row:
```html
<button
    id="more_btn"
    class="btn btn-primary"
    data-fetch-url="'/examples/click_to_load/data?offset=10&amp;limit=10'"
    data-on-click="$$get">
    Load More
</button>
````
This button respond with a set of fragments in a text/event-stream with the next page of results (which will contain a button to load the next page of results). And so on.

```html
<!-- Removed styling for brevity -->
event: morph
id: #more_btn
data: <button id="more_btn" data-fetch-url="&#39;/examples/click_to_load/data?offset=20&amp;limit=10&#39;" data-on-click="$$get">Load More</button>

event: append
id: #click_to_load_rows
data: <tr id="agent_10"><td>Agent Smith</td><td>void11@null.org</td><td>50698444ed39c832</td></tr>

event: append
id: #click_to_load_rows
data: <tr id="agent_11"><td>Agent Smith</td><td>void12@null.org</td><td>205381dc855b977a</td></tr>

event: append
id: #click_to_load_rows
data: <tr id="agent_12"><td>Agent Smith</td><td>void13@null.org</td><td>7ecd2e572c949f74</td></tr>

event: append
id: #click_to_load_rows
data: <tr id="agent_13"><td>Agent Smith</td><td>void14@null.org</td><td>10a0338accf546ca</td></tr>

event: append
id: #click_to_load_rows
data: <tr id="agent_14"><td>Agent Smith</td><td>void15@null.org</td><td>14908a81dd43806</td></tr>

event: append
id: #click_to_load_rows
data: <tr id="agent_15"><td>Agent Smith</td><td>void16@null.org</td><td>57080b213541ea80</td></tr>

event: append
id: #click_to_load_rows
data: <tr id="agent_16"><td>Agent Smith</td><td>void17@null.org</td><td>6fe5d3b279f68366</td></tr>

event: append
id: #click_to_load_rows
data: <tr id="agent_17"><td>Agent Smith</td><td>void18@null.org</td><td>224b1d542cede2db</td></tr>

event: append
id: #click_to_load_rows
data: <tr id="agent_18"><td>Agent Smith</td><td>void19@null.org</td><td>7b7265f3c6196653</td></tr>

event: append
id: #click_to_load_rows
data: <tr id="agent_19"><td>Agent Smith</td><td>void20@null.org</td><td>f2c84c43a4bb670</td></tr>
```