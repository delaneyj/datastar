## Store If Missing

## Demo

<div
  data-on-load="$$get('/examples/store_ifmissing/updates')"
>
  <div>
    Should always be 1234:
    <span id="placeholder"></span>
  </div>
</div>

## Explanation

```html
<div
  id="demo"
  data-store="{id: 1234}"
  data-on-load="$$get('/examples/store_ifmissing/updates')"
>
  <div>
    Should always be 1234:
    <span data-text="$id">should be replaced</span>
  </div>
</div>
```

The `data-store` attribute is used to set the initial state of the store. You can check your browser's Network Devtools to see the `updates` endpoint alternates between sending fragments and direct signal patches like the following:

```md
...

event: datastar-signal
data: ifmissing true
data: store {id:73}

event: datastar-fragment
data: merge upsert_attributes
data: fragment <div id="demo" data-store.ifmissing="{id:74}"></div>

event: datastar-signal
data: ifmissing true
data: store {id:75}

event: datastar-fragment
data: merge upsert_attributes
data: fragment <div id="demo" data-store.ifmissing="{id:76}"></div>

event: datastar-signal
data: ifmissing true
data: store {id:77}

...
```

Since the store is already set, the `data-store.ifmissing` attribute will not overwrite the existing value in either case.
