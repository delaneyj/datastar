package site

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/datastar/backends/go/site/games/snake"
	"github.com/go-chi/chi/v5"
)

func setupExamplesSnake(examplesRouter chi.Router) error {
	width, height, foodCount, foodSize := 600, 300, 10, 10

	sharedGame := &snake.SnakeGame{}
	sharedGame.Restart(width, height, foodCount)
	go sharedGame.Run(context.Background())

	examplesRouter.Get("/snake/updates", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		noVT := datastar.WithoutViewTransitions()
		updateID := sharedGame.AddUpdateFunc(func(game *snake.SnakeGame) error {

			if err := errors.Join(
				datastar.RenderFragmentTempl(sse, SnakeArenaSVG(game, foodSize), noVT),
				datastar.RenderFragmentTempl(sse, SnakeButtons(sharedGame), noVT),
			); err != nil {
				return fmt.Errorf("rendering fragments: %w", err)
			}

			return nil
		})
		defer sharedGame.RemoveUpdateFunc(updateID)

		datastar.RenderFragmentTempl(sse, SnakeArenaSVG(sharedGame, foodSize), noVT)
		datastar.RenderFragmentTempl(sse, SnakeButtons(sharedGame), noVT)

		<-r.Context().Done()
	})

	examplesRouter.Post("/snake/reset", func(w http.ResponseWriter, r *http.Request) {
		sharedGame.Restart(600, 300, 10)
		datastar.NewSSE(w, r)
	})

	examplesRouter.Post("/snake/inputs/{direction}", func(w http.ResponseWriter, r *http.Request) {
		direction := chi.URLParam(r, "direction")
		datastar.NewSSE(w, r)

		switch direction {
		case "up":
			sharedGame.SetSnakeDirection(snake.DirectionUp)
		case "down":
			sharedGame.SetSnakeDirection(snake.DirectionDown)
		case "left":
			sharedGame.SetSnakeDirection(snake.DirectionLeft)
		case "right":
			sharedGame.SetSnakeDirection(snake.DirectionRight)
		default:
			http.Error(w, "Invalid direction", http.StatusBadRequest)
			return
		}

	})

	return nil
}
