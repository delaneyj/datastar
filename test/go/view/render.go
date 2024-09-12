package view

import (
	"context"

	"github.com/a-h/templ"
	"github.com/labstack/echo/v4"
)

func Render(ctx echo.Context, statusCode int, t templ.Component) error {
	buf := templ.GetBuffer()
	defer templ.ReleaseBuffer(buf)

	if err := t.Render(ctx.Request().Context(), buf); err != nil {
		return err
	}

	return ctx.HTML(statusCode, buf.String())
}

func RenderHtml(t templ.Component) string {
	buf := templ.GetBuffer()
	defer templ.ReleaseBuffer(buf)

	if err := t.Render(context.Background(), buf); err != nil {
		return ""
	}

	return buf.String()
}
