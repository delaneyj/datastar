package main

import (
	"go-test/router"
	"net/http"
	"os"
	"path"

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

	e.GET("/favicon.ico", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	})

	e.GET("/public/:filename", func(c echo.Context) error {
		filename := c.Param("filename")
		if info, err := os.Stat(path.Join("./packages/library/dist", filename)); err == nil {
			if info.IsDir() {
				return c.NoContent(http.StatusNotFound)
			} else {
				return c.File(path.Join("./packages/library/dist", filename))
			}
		}
		return c.NoContent(http.StatusNotFound)
	})

	e.GET("*", func(c echo.Context) error {
		return c.String(http.StatusNotFound, "Not Found")
	})
	e.Logger.Fatal(e.Start(":8000"))
}
