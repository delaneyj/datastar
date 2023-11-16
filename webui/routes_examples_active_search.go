package webui

import (
	"context"
	"math"
	"net/http"
	"slices"
	"strings"
	"time"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/gomponents-iconify/iconify/svg_spinners"
	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
	"github.com/go-faker/faker/v4"
	"github.com/lithammer/fuzzysearch/fuzzy"
)

func setupExamplesActiveSearch(ctx context.Context, examplesRouter chi.Router) error {
	examplesRouter.Route("/active_search", func(activeSearchRouter chi.Router) {
		activeSearchRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		type Store struct {
			Search string `json:"search"`
		}

		type User struct {
			ID        string `json:"id"`
			FirstName string `json:"firstName"`
			LastName  string `json:"lastName"`
			Email     string `json:"email"`
		}

		users := make([]*User, 100)
		for i := range users {
			u := &User{
				ID:        faker.UUIDHyphenated(),
				FirstName: faker.FirstName(),
				LastName:  faker.LastName(),
				Email:     faker.Email(),
			}
			users[i] = u
		}

		activeSearchRouter.Get("/data", func(w http.ResponseWriter, r *http.Request) {
			store := &Store{}
			if err := datastar.QueryStringUnmarshal(r, store); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			scores := map[string]float64{}
			s := strings.ToLower(store.Search)
			minScore, maxScore := math.MaxFloat64, -math.MaxFloat64
			for _, u := range users {
				fn := strings.ToLower(u.FirstName)
				ln := strings.ToLower(u.LastName)
				e := strings.ToLower(u.Email)

				fnd := fuzzy.LevenshteinDistance(s, fn)
				lnd := fuzzy.LevenshteinDistance(s, ln)
				ed := fuzzy.LevenshteinDistance(s, e)

				dist := float64(fnd + lnd + ed)
				scores[u.ID] = dist

				minScore = min(minScore, dist)
				maxScore = max(maxScore, dist)
			}

			for id, score := range scores {
				scores[id] = toolbelt.Fit(score, minScore, maxScore, 100, 0)
			}

			// copy users
			filteredUsers := make([]*User, len(users))
			copy(filteredUsers, users)

			// sort users by score
			slices.SortFunc(filteredUsers, func(a, b *User) int {
				return int(10000 * (scores[b.ID] - scores[a.ID]))
			})

			if store.Search != "" {
				time.Sleep(1 * time.Second)
			}
			sse := toolbelt.NewSSE(w, r)
			datastar.RenderFragment(
				sse,
				DIV(
					ID("active_search"),
					CLS("flex flex-col gap-4"),
					datastar.MergeStore(store),
					DIV(
						CLS("flex gap-2"),
						DIV(
							CLS("flex-1"),
							TXT("Search Contacts"),
						),
					),
					DIV(
						CLS("form-control"),
						DIV(
							CLS("flex gap-2"),
							INPUT(
								CLS("input input-bordered flex-1"),
								TYPE("text"),
								PLACEHOLDER("Search..."),
								datastar.Model("search"),
								datastar.FetchURL("'/examples/active_search/data'"),
								datastar.OnDebounce("input", 1*time.Second, datastar.GET_ACTION),
							),
							svg_spinners.BlocksWave(
								CLS("text-5xl datastar-indicator"),
							),
						),
					),
					TABLE(
						CLS("table w-full"),
						CAPTION(TXT("Contacts")),
						THEAD(
							TR(
								TH(TXT("First Name")),
								TH(TXT("Last Name")),
								TH(TXT("Email")),
								TH(TXT("Score")),
							),
						),
						TBODY(
							RANGE(filteredUsers, func(u *User) NODE {
								score := scores[u.ID]
								return TR(
									TD(TXT(u.FirstName)),
									TD(TXT(u.LastName)),
									TD(TXT(u.Email)),
									TD(TXTF("%0.2f", score)),
								)
							}),
						),
					),
				),
			)
		})
	})

	return nil
}
