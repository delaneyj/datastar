## Offline Sync

## Demo

<div
     data-store='{"stuffAlreadyInStore":"this will persist in the store even without network"}'
     data-persist.local
     data-on-online.window="console.log('online, syncing'); @put('/examples/offline_sync/sync', false)"
     data-on-offline.window="console.log('offline')"
>
     <div id="results">Go offline, then online to see the store sync</div>
</div>

## Explanation

```html
<div
  data-store='{"stuffAlreadyInStore":"this will persist in the store even without network"}'
  data-persist.local
  data-on-online.window="console.log('online, syncing'); @put('/examples/offline_sync/sync', false)"
  data-on-offline.window="console.log('offline')"
>
  <div id="results"></div>
</div>
```

The `data-persist.local` attribute dumps the store to a `datastar` key in localStorage. A similar thing happens with `.session` but gets saved to sessionStorage. Any updates will be saved and reload on page refresh. To fully work this needs a service worker like [workbox](https://developers.google.com/web/tools/workbox/) to be installed. To test it go to the network tab of your browser's dev tools and toggle Online/Offline.
