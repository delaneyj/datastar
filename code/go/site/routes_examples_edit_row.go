package site

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	datastar "github.com/starfederation/datastar/code/go/sdk"
)

type ContactEdit struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

func starterEditContacts() []*ContactEdit {
	return []*ContactEdit{
		{
			Name:  "Joe Smith",
			Email: "joe@smith.org",
		},
		{
			Name:  "Angie MacDowell",
			Email: "angie@macdowell.org",
		},
		{
			Name:  "Fuqua Tarkenton",
			Email: "fuqua@tarkenton.org",
		},
		{
			Name:  "Kim Yee",
			Email: "kim@yee.org",
		},
	}
}

func setupExamplesEditRow(examplesRouter chi.Router) error {
	contacts := starterEditContacts()

	emptyStore := &EditRowStore{EditRowIndex: -1}

	examplesRouter.Get("/edit_row/reset", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		contacts = starterEditContacts()
		sse.MergeFragmentTempl(EditRowContacts(contacts, emptyStore))
	})

	examplesRouter.Route("/edit_row/data", func(dataRouter chi.Router) {
		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {

			sse := datastar.NewSSE(w, r)
			sse.MergeFragmentTempl(EditRowContacts(contacts, emptyStore))
		})

		dataRouter.Get("/{index}", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)
			indexStr := chi.URLParam(r, "index")
			i, err := strconv.Atoi(indexStr)
			if err != nil {
				http.Error(w, fmt.Sprintf("error parsing index: %s", err), http.StatusBadRequest)
				return
			}
			store := &EditRowStore{
				EditRowIndex: i,
				Name:         contacts[i].Name,
				Email:        contacts[i].Email,
			}

			sse.MergeFragmentTempl(EditRowContacts(contacts, store))
		})
	})

	examplesRouter.Route("/edit_row/edit", func(editRouter chi.Router) {
		editRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			store := &EditRowStore{}
			if err := datastar.ReadSignals(r, &store); err != nil {
				http.Error(w, fmt.Sprintf("error unmarshalling contact : %s", err), http.StatusBadRequest)
			}

			if store.EditRowIndex < 0 || store.EditRowIndex >= len(contacts) {
				http.Error(w, fmt.Sprintf("invalid index: %d", store.EditRowIndex), http.StatusBadRequest)
				return
			}

			i := store.EditRowIndex
			c := contacts[i]
			store = &EditRowStore{
				EditRowIndex: i,
				Name:         c.Name,
				Email:        c.Email,
			}

			sse := datastar.NewSSE(w, r)
			sse.MergeFragmentTempl(EditRowContacts(contacts, store))
		})

		editRouter.Patch("/", func(w http.ResponseWriter, r *http.Request) {
			store := &EditRowStore{}
			if err := datastar.ReadSignals(r, &store); err != nil {
				http.Error(w, fmt.Sprintf("error unmarshalling store : %s", err), http.StatusBadRequest)
				return
			}

			if store.EditRowIndex < 0 || store.EditRowIndex >= len(contacts) {
				http.Error(w, fmt.Sprintf("invalid index: %d", store.EditRowIndex), http.StatusBadRequest)
				return
			}
			i := store.EditRowIndex
			c := contacts[i]
			c.Name = store.Name
			c.Email = store.Email

			sse := datastar.NewSSE(w, r)
			sse.MergeFragmentTempl(EditRowContacts(contacts, emptyStore))
		})
	})

	return nil
}
