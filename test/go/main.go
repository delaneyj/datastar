package main

import (
	"go-test/router"
	"net/http"

	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()
	// inject pages routes
	pagesGroup := e.Group("/")
	router.PagesRoutes(pagesGroup)
	// inject api routes
	apiGroup := e.Group("/api")
	router.ApiRoutes(apiGroup)

	e.GET("/datastar.js", func(c echo.Context) error {
		return c.File("./packages/library/dist/datastar.js")
	})

	e.GET("/favicon.ico", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	})

	e.GET("*", func(c echo.Context) error {
		return c.String(http.StatusNotFound, "Not Found")
	})
	e.Logger.Fatal(e.Start(":8000"))
}
