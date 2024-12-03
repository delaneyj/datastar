# WIP Release Notes for Datastar

## 0.21.0 - Unreleased

We’ve doubled down on the mantra that “Datastar makes nestable signals declarative” in v0.21.0. To that end, we’ve removed special characters, made the API more explicit and consistent, and fixed some restrictions to nested signals that we discovered. Signal values are now accessed in expressions using the syntax `signalName.value`, actions no longer have a prefix, and attribute keys support nested signals using dot-delimited paths.

### Added

- Added the ability to merge one-off signals using the syntax `data-signals-signalname="value"`.
- Added the ability to use dot-delimited paths to denote nested signals in applicable attribute keys (`data-signals-foo.bar="value"`).
- Added the ability to use multiple attributes using the syntax `data-attributes="{attrName1: value1, atattrName2: value2}"`.
- Added the ability to use a single class using the syntax `data-class-hidden="foo.value"`.
- Added links to error descriptions in the console for every error thrown.

### Changed

- Signals no longer have the `$` prefix and must be acessed using a `.value` suffix (`signalName.value`). 
- Action plugins no longer have the `$` prefix.
- Renamed the `data-store` attribute to `data-signals`.
- Renamed the `data-bind` attribute to `data-attributes`.
- Renamed the `data-model` attribute to `data-bind`.
- Changed the `data-*` attribute modifier delimiter from `.` to `?` and `&` (`data-on-keydown?debounce_100ms&throttle_lead="value"`).
- The the `get()`, `post()`, `put()`, and `delete()` plugins have been replaced by a single `sse()` plugin that accepts the method as an option (`sse(url, {method="get"})`).
- The `setAll()` and `toggleAll` plugins now accept a dot-delimited path format, instead of a regular expression.

### Fixed

- Fixed headers not merging correctly. 
- Fixed new lines in the SDK protocol for paths.
