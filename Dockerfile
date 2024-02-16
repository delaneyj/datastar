FROM docker.io/golang:1.21.5-alpine AS build

RUN apk add --no-cache upx
ENV PORT=8080

WORKDIR /src
COPY go.* .
RUN go mod download
COPY . .
RUN --mount=type=cache,target=/root/.cache/go-build \
    go build -o /out/webui cmd/webui/main.go
RUN upx /out/webui

FROM scratch
COPY --from=build /out/webui /
ENTRYPOINT ["/webui"]