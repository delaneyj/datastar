package page

import (
	"go-test/view"
	"go-test/view/fragment"
	"go-test/view/layout"
	"net/http"

	"github.com/labstack/echo/v4"
)

func PageHandlers(g *echo.Group) {

	g.GET("", func(c echo.Context) error {
		page := fragment.Index()
		return view.Render(c, http.StatusOK, layout.Default(page))
	})

	g.GET("guide", func(c echo.Context) error {
		page := fragment.Guide()
		return view.Render(c, http.StatusOK, layout.Default(page))
	})

	g.GET("examples", func(c echo.Context) error {
		page := fragment.Examples()
		return view.Render(c, http.StatusOK, layout.Default(page))
	})

	g.GET("reference", func(c echo.Context) error {
		page := fragment.Reference()
		return view.Render(c, http.StatusOK, layout.Default(page))
	})

	g.GET("essays", func(c echo.Context) error {
		page := fragment.Essays()
		return view.Render(c, http.StatusOK, layout.Default(page))
	})
}
