package site

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func setupExamplesBackoff(examplesRouter chi.Router) error {

	examplesRouter.Put("/backoff/notValid", func(w http.ResponseWriter, r *http.Request) {
		flusher, ok := w.(http.Flusher)
		if !ok {
			panic("response writer does not support flushing")
		}
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("Content-Type", "text/event-stream")
		flusher.Flush()

		frag := `<div id="output"><h1>Funny DataStar Text</h1></div>`

		w.Write([]byte("event: datastar-fragment\n"))
		// this is going to generate error because inner_html is not a valid merge type <= this should be also corrected in documentation; should be inner
		//
		// WHEN ENDPOINT IS GETTING ERROR DATASTAR IS STARTING TO REPEAT THE SAME REQUEST OVER AND OVER AGAIN
		w.Write([]byte("data: merge inner_html\n"))
		/////////////////////////////
		w.Write([]byte(fmt.Sprintf("data: fragment %s\n\n", frag)))

		flusher.Flush()
	})

	return nil
}
