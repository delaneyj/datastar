FROM ghcr.io/starfederation/datastar-dev AS build

ENV PORT=8080

RUN apt update && sudo apt upgrade \
    && \
    set -eux; \
    # Packages to install
    apt install -y \
    upx

WORKDIR /src
COPY go.* *.go ./
RUN go mod download
RUN git lfs fetch --all && git lfs pull && git lfs checkout
COPY code/go/. ./code/go/
RUN task tools
COPY code/go/. ./code/go/
RUN --mount=type=cache,target=/root/.cache/go-build \
    go build -ldflags="-s" -o /out/site code/go/cmd/site/main.go
RUN upx -9 -k /out/site

FROM scratch
COPY --from=build /out/site /
ENTRYPOINT ["/site"]