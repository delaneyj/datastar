# Release Notes for Datastar

## 0.20.0 - 2024-11-22

VersionClientByteSize     = 35970->35789
VersionClientByteSizeGzip = 12647->12568

> [!WARNING]
> This update contains breaking changes to attributes, actions and SSE events.

### Added
- SDKs
  - .NET
    - Initial SDK release! #231
  - PHP
    - Allow KV pairs
    - Author
- DevOps
  - added `make test` & `make clean` to development Dockerfile

### Changed
- Client
  - Function expression optimizations #234
  - Truthy Attributes were not getting set correctly #234
  - Fix invalid headers sent via SSE #241
  - Added hooks so NPM will package the correct files
- SDKs
  - updated README for clarity around contributing
  - Go
    - Fix inverted logic for ViewTransitions #238
  - PHP
    - tagged SDK 1.0.0-alpha.1
    - fixed retry duration
    - general cleanup
- Website
  - Bundler getting create valid zip for Windows #228
  - General site improvements
  - Actions section in getting started
  - Fixed broken links for SDKs and CDN #225
  - Try to fix Safari bug around caching SSE connections #239
- Devops
  - fix `make dev` to work cross-platform
  - moved development Dockerfile from Alpine to Ubuntu


### Removed
- DevOps
  - Removed broken Github Actions
