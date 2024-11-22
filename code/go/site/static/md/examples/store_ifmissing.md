## Store If Missing

## Demo

<div
  data-on-load="$get('/examples/store_ifmissing/updates')"
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
  data-on-load="$get('/examples/store_ifmissing/updates')"
>
  <div>
    Should always be 1234:
    <span data-text="$id">should be replaced</span>
  </div>
</div>
```

The `data-store` attribute is used to set the initial state of the store. You can check your browser's Network Devtools to see the `updates` endpoint alternates between sending fragments and direct signal merges like the following:

```md
...

event: datastar-merge-signals
data: ifmissing true
data: store {id:73}

event: datastar-merge-fragments
data: mergeMode upsertAttributes
data: fragment <div id="demo" data-store.ifmissing="{id:74}"></div>

event: datastar-merge-signals
data: ifmissing true
data: store {id:75}

event: datastar-merge-fragments
data: mergeMode upsertAttributes
data: fragment <div id="demo" data-store.ifmissing="{id:76}"></div>

event: datastar-merge-signals
data: ifmissing true
data: store {id:77}

...
```

Since the store is already set, the `data-store.ifmissing` attribute will not overwrite the existing value in either case.
