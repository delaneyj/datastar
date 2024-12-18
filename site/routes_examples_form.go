package site

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	datastar "github.com/starfederation/datastar/sdk/go"
)

func setupExamplesForm(examplesRouter chi.Router) error {
	examplesRouter.Get("/form/data", func(w http.ResponseWriter, r *http.Request) {
		ProcessFrom(w, r, "GET")
	})

	examplesRouter.Post("/form/data", func(w http.ResponseWriter, r *http.Request) {
		ProcessFrom(w, r, "POST")
	})

	return nil
}

func ProcessFrom(w http.ResponseWriter, r *http.Request, method string) {
	sse := datastar.NewSSE(w, r)

	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	formData := r.Form
	jsonData, err := json.Marshal(formData)
	if err != nil {
		http.Error(w, "Failed to encode form data as JSON", http.StatusInternalServerError)
		return
	}

	sse.ExecuteScript(fmt.Sprintf(`alert('Form data received via %s request: %s')`, method, jsonData))
}
