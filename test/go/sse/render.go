package sse

import (
	"bytes"
	"net/http"

	"github.com/labstack/echo/v4"
)

func RenderToSSE(c echo.Context, data [][]string) error {
	c.Response().Header().Set(echo.HeaderContentType, "text/event-stream")
	c.Response().Header().Set("Cache-Control", "no-cache")
	c.Response().Header().Set("Connection", "keep-alive")

	c.Response().WriteHeader(http.StatusOK)

	buf := bytes.Buffer{}

	for _, row_out := range data {
		for i, row_in := range row_out {
			if i == len(row_out)-1 {
				buf.WriteString(row_in + "\n\n")
			} else {
				buf.WriteString(row_in + "\n")
			}
		}
	}

	return c.Stream(http.StatusOK, "", &buf)
}
