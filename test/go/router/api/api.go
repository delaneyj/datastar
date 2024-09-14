package api

import (
	"go-test/sse"
	"go-test/view"
	"go-test/view/fragment"

	"github.com/labstack/echo/v4"
)

func ApiHandlers(g *echo.Group) {

	g.PUT("/index", func(c echo.Context) error {
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
		return sse.RenderToSSE(c, data)
	})

	g.PUT("/guide", func(c echo.Context) error {
		data := [][]string{
			{
				"event: datastar-fragment",
				"data: history /guide",
				"data: merge inner_element",
				"data: selector #main-container",
				"data: fragment " + view.RenderHtml(fragment.Guide()),
			},
		}
		return sse.RenderToSSE(c, data)
	})

	g.PUT("/examples", func(c echo.Context) error {
		data := [][]string{
			{
				"event: datastar-fragment",
				"data: history /examples",
				"data: merge inner_element",
				"data: selector #main-container",
				"data: fragment " + view.RenderHtml(fragment.Examples()),
			},
		}
		return sse.RenderToSSE(c, data)
	})

	g.PUT("/reference", func(c echo.Context) error {
		data := [][]string{
			{
				"event: datastar-fragment",
				"data: history /reference",
				"data: merge inner_element",
				"data: selector #main-container",
				"data: fragment " + view.RenderHtml(fragment.Reference()),
			},
		}
		return sse.RenderToSSE(c, data)
	})

	g.PUT("/essays", func(c echo.Context) error {
		data := [][]string{
			{
				"event: datastar-fragment",
				"data: history /essays",
				"data: merge inner_element",
				"data: selector #main-container",
				"data: fragment " + view.RenderHtml(fragment.Essays()),
			},
		}
		return sse.RenderToSSE(c, data)
	})

	g.PUT("/redir", func(c echo.Context) error {
		data := [][]string{
			{
				"event: datastar-fragment",
				"data: redirect /guide",
			},
		}
		return sse.RenderToSSE(c, data)

	})
}
