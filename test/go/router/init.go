package router

import (
	"go-test/router/api"
	"go-test/router/page"

	"github.com/labstack/echo/v4"
)

func PagesRoutes(r *echo.Group) {
	page.PageHandlers(r)

}

func ApiRoutes(r *echo.Group) {
	api.ApiHandlers(r)
}
