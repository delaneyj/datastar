# Hacking on Datastar

## Library

If all you want is to build the library, you will need the following:

- [pnpm](https://pnpm.io/)
- [Node](https://nodejs.org/)

```
$ cd packages/library
$ pnpm install
$ pnpm build
```

The compiled files can be found in `packages/library/dist/`

## Website

To run the examples website you will need the following:

- [Go](https://go.dev/)
- [Taskfile](https://taskfile.dev/)
- [Git-LFS](https://git-lfs.com/)

Start with a `git lfs checkout` in the datastar root folder then run `task tools` followed by `task -w hot`.

```
$ git lfs checkout
$ task tools
$ task -w hot
```

The website should be available on http://localhost:8080 with hot-reloading enabled.

## End to end tests

Once you have the website running, you should be able to run the
[playwright](https://playwright.dev) tests. (that is, if playwright
[supports your operating system](https://playwright.dev/docs/intro#system-requirements).)

```
$ task test
```

## Overriding Rollup

Rollup does not offer native binaries for all platforms, if your operating system or architecture is not
supported, you will need to use the wasm build. Just add the following to the top level package.json
file, creating it if necessary.

```
{
  "pnpm": {
    "overrides": {
      "vite>rollup": "npm:@rollup/wasm-node"
    }
  }
}
```
