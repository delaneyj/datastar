# WIP Release Notes for Datastar

## 0.21.0-beta - 2024-12-06

We’ve overhauled Datastar in v0.21.0, doubling down on making nestable signals declarative. To that end, we’ve removed special characters, made the API more explicit and consistent, and fixed some restrictions to nested signals that we discovered. Signal values are now accessed in expressions using the syntax `signalName.value`, actions no longer have a prefix, and attribute keys support nested signals using dot-delimited paths.

The new [Datastar VSCode extension](https://marketplace.visualstudio.com/items?itemName=starfederation.datastar-vscode) has autocomplete for all v0.21.0 `data-*` attributes and the `sse` action, and we’ve painstakingly added error pages for every error that can be thrown.

This should be the final round of API changes before v1.0.0 🚀

### Added

- Added the ability to merge one-off signals using the syntax `data-signals-foo="value"`.
- Added the ability to use dot-delimited paths to denote nested signals in applicable attribute keys (`data-signals-foo.bar="value"`).
- Added the ability to use multiple attributes using the syntax `data-attributes="{attrName1: value1, attrName2: value2}"`.
- Added the ability to use a single classes using the syntax `data-class-hidden="foo.value"`.
- Added the ability to use a key instead of a value to denote a signal name in the `data-bind`, `data-indicator` and `data-ref` attributes (`data-bind-foo`, `data-indicator-foo`, `data-ref-foo`).
- Added error codes and links to descriptions in the console for every error thrown.
- Retries and backoff for SSE connections now configurable

### Changed

- Signals no longer have the `$` prefix and must be acessed using a `.value` suffix (`signalName.value`).
- Action plugins no longer have the `$` prefix.
- Renamed the `data-store` attribute to `data-signals`.
- Renamed the `data-bind` attribute to `data-attributes`.
- Renamed the `data-model` attribute to `data-bind`.
- Changed the `data-*` attribute modifier delimiter from `.` to `:` (`data-on-keydown:debounce_100ms:throttle_lead="value"`).
- The the `get()`, `post()`, `put()`, and `delete()` plugins have been replaced by a single `sse()` plugin that accepts the method as an option (`sse(url, {method: 'post'})`), defaulting to `get`.
- The `setAll()` and `toggleAll` plugins now accept a path prefix, instead of a regular expression.

### Fixed

- Fixed headers not merging correctly.
- Fixed new lines in the SDK protocol for paths.
- Possible XSS vulnerability in the errors page
- Using `evt` in a `data-on` might have had a `.value` that would cause an error. This has been fixed. #326