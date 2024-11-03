# Datastar Docker Dev

Datastart comes with a development environment for developing [Datastar](https://github.com/delaneyj/datastar) via a Docker container.

It takes care of the setup listed in the for you in a Dockerized environment, which allows you to get it up and running quickly & easily.

The only requirement is that you have [Docker](https://www.docker.com/products/docker-desktop) installed (you do not need `golang`, `node`, `npm`, `pnpm`, or anything else installed locally).

## Why Docker?

Developers who have adopted [Docker](https://www.docker.com/) for a containerized approach to development are used to not having to install a matching development infrastructure each time they approach a project.

This allows you to "shrink-wrap" the devops needed to run a project in a container, which will run anywhere, on any machine, without having to do any meticulous setup.

It also allows you to easily swap between basic things like node versions, without affecting your local computer. You can even run Vite in one version of Node, and your app in another.

## Quick Start

In terminal, `cd` to the `datastar/` directory, and then type:

```
make dev
```

The first time you run this command, it may take a bit of time to build the Docker image, and download all of the appropriate Go/Node packages.

Then just navigate to `http://localhost:8080` in your browser, and Datastar site from `backends/go/site/` will be up and running, alongside a Vite dev server serving up `packages/library/`.

You can freely make changes the `packages/library/` Datastar codebase, and the changes will instantly be reflected in your browser via Hot Module Replacement (HMR).

You can also make changes to the `backends/go/site/` Datastar website backend, and the backend will be rebuilt and reload automatically.

## Using Datastar Docker Dev

Vite.js Docker Dev uses the venerable `make` command to automate setup and access to the Docker containers used.

It uses `make` because it's available pre-installed on any development machine.

See the [Using Make & Makefiles to Automate your Frontend Workflow](https://nystudio107.com/blog/using-make-makefiles-to-automate-your-frontend-workflow) article for more on `make`.

The make tool is available for just about every platform you can imagine, and is installed with the [XCode CLI Tools](https://www.embarcadero.com/starthere/xe5/mobdevsetup/ios/en/installing_the_commandline_tools.html) on the Mac, and [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10) on Windows. Probably you have these installed already if you’re doing development.

Below are details and options available in each of the provided `make` commands:

* `make dev` - starts up the Go website server for the backend and the Vite dev server for the frontend
* `make task xxx` - runs the specified task from the `Taskfile.yml` inside of the Docker container
* `make clean` - deletes the `packages/library/node_modules/` directory & `packages/library/pnpm-lock.yaml/` file
* `make ssh` - gives you a shell inside of the Docker container
* `make image-build` - rebuilds the Docker image from scratch (you will probably never need this)

### CLI Arguments

You can pass in optional CLI arguments to override the default settings Datastar dev uses:

* `TAG=` (default: `1.23.1-alpine`) - allows you to specify the official [golang Docker image](https://hub.docker.com/_/golang) tag that should be used. Using this, you can change the version of Go the container runs, e.g.: `make image-build TAG="1.23-alpine"` will use the latest version of Go 1.23 for Alpine Linux.
* `VITE_PORT=` (default: `5173`) - allows you to specify the port that the Vite dev server will run off of. e.g.: `make dev VITE_PORT=3030` will cause the Vite dev server to run off of port `3030`

### Terminating

To terminate the `datastar-dev` Docker container, type Control-C in the terminal.

# Manual Hacking on Datastar

If you already have all of the tools you need pre-installed, and want to hack on Datastar without using the Dockerized environment, this section is for you!
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
