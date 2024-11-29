package site

import (
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/sessions"
	datastar "github.com/starfederation/datastar/code/go/sdk"
)

func setupExamplesQuizSlow(examplesRouter chi.Router, signals sessions.Signals) error {
	sessionKey := "datastar-quiz-slow-example"

	examplesRouter.Get("/quiz_slow/data", func(w http.ResponseWriter, r *http.Request) {
		session, err := signals.Get(r, sessionKey)
		if err != nil {
			return
		}

		// Get the last question ID from the session
		lastQuestionId, ok := session.Values["lastQuestionId2"].(int)
		if !ok {
			lastQuestionId = -1
		}

		sse := datastar.NewSSE(w, r)
		questionID := randomQuestionId(lastQuestionId)
		QA := qaList[questionID]
		time.Sleep(2 * time.Second)
		sse.MergeFragments(fmt.Sprintf(`<div id="question3">%s</div>`, QA.Question))
		sse.MarshalAndMergeSignals(map[string]any{
			"lastQuestionId2": questionID,
		})
	})

	return nil
}
