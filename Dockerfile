FROM docker.io/golang:1.23.1-alpine AS build

RUN apk add --no-cache upx
ENV PORT=8080

WORKDIR /src
COPY go.* *.go ./
RUN go mod download
COPY backends/go/. ./backends/go/
RUN --mount=type=cache,target=/root/.cache/go-build \
    go build -ldflags="-s" -o /out/site backends/go/cmd/site/main.go
RUN upx -9 -k /out/site

FROM scratch
COPY --from=build /out/site /
ENTRYPOINT ["/site"]