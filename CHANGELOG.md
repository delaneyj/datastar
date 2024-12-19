# WIP Release Notes for Datastar

## v0.21.4

### Added

- Added a `retryInterval` option to the `sse()` action, defaulting to 1 second.


### Fixed

- Fixed a bug in which local signals were being unintentionally sent with requests ([#387](https://github.com/starfederation/datastar/issues/387)).
- Fixed a bug in which the bundler was not exporting Datastar ([#403](https://github.com/starfederation/datastar/issues/403)).