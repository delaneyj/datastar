package site

import (
	"math"
	"net/http"
	"slices"
	"strings"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/svg_spinners"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
	"github.com/go-faker/faker/v4"
	"github.com/lithammer/fuzzysearch/fuzzy"
)

func setupExamplesActiveSearch(examplesRouter chi.Router) error {

	// activeSearchRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
	// 	examplePage(w, r)
	// })

	type Store struct {
		Search string `json:"search"`
	}

	type User struct {
		ID        string `json:"id"`
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Email     string `json:"email"`
	}

	users := make([]*User, 256)
	for i := range users {
		u := &User{
			ID:        faker.UUIDHyphenated(),
			FirstName: faker.FirstName(),
			LastName:  faker.LastName(),
			Email:     faker.Email(),
		}
		users[i] = u
	}

	examplesRouter.Get("/active_search/data", func(w http.ResponseWriter, r *http.Request) {
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

		sse := toolbelt.NewSSE(w, r)
		datastar.RenderFragment(
			sse,
			DIV().
				ID("active_search").
				CLASS("flex flex-col gap-4").
				DATASTAR_STORE(store).
				Children(
					DIV().
						CLASS("flex gap-2").
						Children(
							DIV().
								CLASS("flex-1").
								Text("Search Contacts"),
						),
					DIV().
						CLASS("form-control").
						Children(
							DIV().
								CLASS("flex gap-2").
								Children(
									INPUT().
										CLASS("bg-accent-900 border-2 border-accent-600 text-accent-100 text-sm rounded-lg focus:ring-primary-400 focus:border-primary-400 block w-full p-2.5").
										TYPE("text").
										PLACEHOLDER("Search...").
										DATASTAR_MODEL("search").
										DATASTAR_ON("input", datastar.GET("/examples/active_search/data"), InputOnModDebounce(1*time.Second)),
									svg_spinners.BlocksWave().
										CLASS("text-5xl datastar-indicator"),
								),
						),
					TABLE().
						CLASS("table w-full").
						Children(
							CAPTION(Text("Contacts")),
							THEAD(
								TR(
									TH(Text("First Name")),
									TH(Text("Last Name")),
									TH(Text("Email")),
									TH(Text("Score")),
								),
							),
							TBODY(
								Range(filteredUsers[0:10], func(u *User) ElementRenderer {
									score := scores[u.ID]
									return TR(
										TD(Text(u.FirstName)),
										TD(Text(u.LastName)),
										TD(Text(u.Email)),
										TD(TextF("%0.2f", score)),
									)
								}),
							),
						),
				),
		)
	})

	return nil
}
