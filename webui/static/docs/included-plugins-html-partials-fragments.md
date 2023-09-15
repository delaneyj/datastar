[Back to Intersects](/docs/included-plugins-ui-intersects)

# HTML Fragments

## Why

This is a more explicit take on the same kind of behavior that [HTMX](https://htmx.org/) provides.  It allows you to declaratively use [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to create and merge HTML snippets from the server of your choice.  It's not to be as generic as HTMX but feel the defaults put you in the [pit of success](https://blog.codinghorror.com/falling-into-the-pit-of-success/).


![ref](/static/images/so-fetch.gif)


## Example

```html
<div data-get="/api/globalCount" data-on-click="@get"/>
```

## Data-* Attributes
All attributes are expressions that should resolve to a URL string.
* `data-get`
* `data-post`
* `data-put`
* `data-patch`
* `data-delete`

## Actions
All actions send off a request to the URL specified in the data-* attribute and merge the response into the element.  The default behavior is to replace the element with the response.  You can change this behavior by modulating your response.

* `@get`
* `@post`
* `@put`
* `@patch`
* `@delete`

## The Request
```mermaid
stateDiagram-v2
    state "Data Stack" as dataStack
    state "Request Headers (if any)" as headers
    state "Is GET?" as isGet
    state "Create query string with dataStack" as createQueryString
    state "Create body with dataStack contents" as createBody
    state "Fetch" as fetch
    state "Server Response" as res

    dataStack --> headers
    headers --> isGet
    isGet --> createQueryString : Yes
    isGet --> createBody : No
    createQueryString --> fetch
    createBody --> fetch
    fetch --> res
```

# The Response
```mermaid
stateDiagram-v2
    state "Server Response" as res
    state "HTML Document" as doc
    state "Throw Error" as err
    state "Is Status 2xx" as is2xx
    state "For each top level HTML fragment in response" as each
    state "Has data-target-selector attribute?" as hasTarget
    state "Set target to element that initiated request" as setTarget
    state "Has data-swap attribute?" as hasSwap
    state "Set swap to 'morph'" as setSwap
    state "Swap target with fragment" as swap

    res --> is2xx
    is2xx --> err : No
    is2xx --> each : Yes
    each --> hasTarget
    each --> setTarget
    hasTarget --> hasSwap : Yes
    setTarget --> hasSwap : No
    hasSwap --> setSwap : No
    hasSwap --> swap : Yes
    setSwap --> swap
    swap --> doc
```

| Attribute | Description |
| --- | --- |
| `data-target="selector"` | The element to replace with the response.  If not specified, the element that initiated the request will be used. |
| `data-swap="morph"` | Use [idiomorph](https://github.com/delaneyj/datastar/blob/main/library/src/lib/external/idiomorph.ts) base on [bigskysoftware/idiomorph](https://github.com/bigskysoftware/idiomorph)
| `data-swap="inner"` | Replace inner html of element |
| `data-swap="outer"` | Replace entire element |
| `data-swap="prepend"` | Insert as first child of element |
| `data-swap="append"` | Insert as last child of element |
| `data-swap="before"` | Insert before element |
| `data-swap="after"` | Insert after element |
| `data-swap="delete"` | Remove element |

![ref](/static/images/no-fetch.gif)

[Next Headers](/docs/included-plugins-html-partials-headers)
