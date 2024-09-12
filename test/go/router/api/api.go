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

	g.PUT("/index", func(c echo.Context) error {
		return renderToSSE(c, fragment.Index(), "/")
	})

	g.PUT("/guide", func(c echo.Context) error {
		return renderToSSE(c, fragment.Guide(), "/guide")
	})

	g.PUT("/examples", func(c echo.Context) error {
		return renderToSSE(c, fragment.Examples(), "/examples")
	})

	g.PUT("/reference", func(c echo.Context) error {
		return renderToSSE(c, fragment.Reference(), "/reference")
	})

	g.PUT("/essays", func(c echo.Context) error {
		return renderToSSE(c, fragment.Essays(), "/essays")
	})

	g.PUT("/redir", func(c echo.Context) error {
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

func renderToSSE(c echo.Context, t templ.Component, history string) error {
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
