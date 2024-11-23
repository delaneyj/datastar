package site

import (
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	datastar "github.com/starfederation/datastar/code/go/sdk"
)

func setupExamplesQuizSlow(examplesRouter chi.Router) error {
	examplesRouter.Get("/quiz/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		questionID := rand.Intn(len(qaList))
		QA := qaList[questionID]
		time.Sleep(2 * time.Second)
		sse.MergeFragments(fmt.Sprintf(`<div id="question3">%s</div>`, QA.Question))
	})

	return nil
}
