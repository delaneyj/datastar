# Release Notes for Datastar

## 0.20.0 - Unreleased

> [!WARNING]
> This update contains breaking changes to attributes, actions and SSE events.

### Added

- Added a custom bundle [bundler](https://data-star.dev/bundler).
- Added SDKs for Go, PHP and .NET.
- Added the `data-persist` attribute.
- Added the `data-replace-url` attribute.
- Added the `data-indicator` attribute.
- Added the `datastar-remove-fragments` SSE event.
- Added the `datastar-remove-signals` SSE event.
- Added the `datastar-execute-script` SSE event.

### Changed

- Changed the `$$` prefix to `$` for action plugins.
- The `data-model` attribute now upserts signals into the store.
- The `data-ref` attribute now upserts a signal into the store.
- The `data-show` attribute now shows/hides an element using the `style` attribute only. Modifiers have been removed. For anything custom, use `data-class` instead.
- Renamed the `datastar-fragment` SSE event to `datastar-merge-fragments`.
- Renamed the `datastar-signal` SSE event to `datastar-merge-signals`.
- Renamed the `fragment` dataline literal for SSE events to `fragments`.
- Renamed the `store` dataline literal for SSE events to `signals`.
- Renamed the `upsert_attributes` merge mode to `upsertAttributes` in the fragment event.
- Renamed the `settle` option to `settleDuration` in the fragment event and changed the default value to `300`.
- Renamed the `vt` option to `useViewTransition` in the fragment event and changed the default value to `false`.
- Changed the second argument of SSE actions from `onlyRemoteSignals` to an optional object with `headers` and `onlyRemoteSignals` keys, defaulting to `{}` and `true` respectively.
- Error codes that roughly match HTTP status codes are now used.

### Removed

- Removed the `~ref` syntax. Use the signal created by `data-ref` directly instead.
- Removed the `local` and `session` modifiers from `data-store`. Use the new `data-persist` attribute instead.
- Removed the `data-teleport` attribute. 
- Removed the `data-header` attribute.  Use the `headers` option in SSE actions instead.
- Removed the `$$isFetching` action and the `data-fetch-indicator` attribute. Use `data-indicator` instead.
- Removed the `datastar-delete` SSE event. Use the new `datastar-remove-fragments` and `datastar-remove-signals` SSE events instead.
- Removed the `datastar-redirect` and `datastar-console` SSE events. Use the new `datastar-execute-script` SSE event instead.
- Removed `sendDatastarEvent` from ctx.  We have to rethink how to expose events for a better try at the inspector.
- Removed the concept of `_dsPlugins`, made unnecessary by a more consistent architecture.
