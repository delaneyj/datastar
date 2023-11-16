## Lazy Tabs

[Original HTMX Version](https://htmx.org/examples/tabs-hateoas/)

## Demo
<div
    id="lazy_tabs"
    data-fetch-url="'/examples/lazy_tabs/data'"
    data-on-load="$$get"
>
     Replace me
</div>

## Explanation
This example shows how easy it is to implement tabs using htmx. Following the principle of [Hypertext As The Engine Of Application State](https://en.wikipedia.org/wiki/HATEOAS), the selected tab is a part of the application state. Therefore, to display and select tabs in your application, simply include the tab markup in the returned HTML.


