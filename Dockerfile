FROM docker.io/golang:1.23.3-alpine AS build

RUN apk add --no-cache upx
ENV PORT=8080

WORKDIR /src
COPY . .
RUN go mod download
COPY site ./site
RUN --mount=type=cache,target=/root/.cache/go-build \
    go build -ldflags="-s" -o /out/site site/cmd/site/main.go
RUN upx -9 -k /out/site

FROM alpine
RUN chmod a=rwx,u+t /tmp
COPY --from=build /out/site /
ENTRYPOINT ["/site"]