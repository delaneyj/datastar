package site

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	datastar "github.com/starfederation/datastar/sdk/go"
)

func setupExamplesForm(examplesRouter chi.Router) error {
	examplesRouter.Get("/form_data/data", func(w http.ResponseWriter, r *http.Request) {
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

		sse.ExecuteScript(fmt.Sprintf(`alert('Form data received via GET request: %s')`, jsonData))
	})

	examplesRouter.Post("/form_data/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		
		err := r.ParseMultipartForm(1 << 20)
		if err != nil {
			http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
			return
		}
		
		formData := r.Form
		jsonData, err := json.Marshal(formData)
		if err != nil {
			http.Error(w, "Failed to encode form data as JSON", http.StatusInternalServerError)
			return
		}

		sse.ExecuteScript(fmt.Sprintf(`alert('Form data received via POST request: %s')`, jsonData))
	})

	return nil
}