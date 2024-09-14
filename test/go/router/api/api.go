package api

import (
	"bytes"
	"go-test/view"
	"go-test/view/fragment"
	"net/http"

	"github.com/a-h/templ"
	"github.com/labstack/echo/v4"
)

func ApiHandlers(g *echo.Group) {

	g.GET("/index", func(c echo.Context) error {
		data := [][]string{
			{
				"event: datastar-fragment",
				"data: history /",
				"data: merge inner_element",
				"data: selector #main-container",
				"data: fragment " + view.RenderHtml(fragment.Index()),
			},
			{
				"event: datastar-signal",
				"data: {_someData: 'some data comming from server'}",
			},
			{
				"event: datastar-signal-ifmissing",
				"data: {foo: 1234}",
			},
		}
		return renderToSSE(c, data)
	})

	g.GET("/guide", func(c echo.Context) error {
		return renderToSSEOld(c, fragment.Guide(), "/guide")
	})

	g.GET("/examples", func(c echo.Context) error {
		return renderToSSEOld(c, fragment.Examples(), "/examples")
	})

	g.GET("/reference", func(c echo.Context) error {
		return renderToSSEOld(c, fragment.Reference(), "/reference")
	})

	g.GET("/essays", func(c echo.Context) error {
		return renderToSSEOld(c, fragment.Essays(), "/essays")
	})

	g.GET("/redir", func(c echo.Context) error {
		c.Response().Header().Set(echo.HeaderContentType, "text/event-stream")
		c.Response().Header().Set("Cache-Control", "no-cache")
		c.Response().Header().Set("Connection", "keep-alive")

		c.Response().WriteHeader(http.StatusOK)

		buf := bytes.Buffer{}

		buf.WriteString("event: datastar-fragment\n")
		buf.WriteString("data: redirect /guide\n\n")
		// buf.WriteString("data: selector #main-container\n")
		// buf.WriteString("data: fragment " + view.RenderHtml(t) + "\n\n")

		return c.Stream(http.StatusOK, "", &buf)
	})
}

func renderToSSEOld(c echo.Context, t templ.Component, history string) error {
	c.Response().Header().Set(echo.HeaderContentType, "text/event-stream")
	c.Response().Header().Set("Cache-Control", "no-cache")
	c.Response().Header().Set("Connection", "keep-alive")

	c.Response().WriteHeader(http.StatusOK)

	buf := bytes.Buffer{}

	buf.WriteString("event: datastar-fragment\n")
	if len(history) > 0 {
		buf.WriteString("data: history " + history + "\n")
	}
	buf.WriteString("data: merge inner_element\n")
	buf.WriteString("data: selector #main-container\n")
	buf.WriteString("data: fragment " + view.RenderHtml(t) + "\n\n")

	return c.Stream(http.StatusOK, "", &buf)
}

func renderToSSE(c echo.Context, data [][]string) error {
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
