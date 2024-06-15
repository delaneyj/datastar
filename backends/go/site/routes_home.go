package site

import (
	"bytes"
	"net/http"
	"strconv"

	"github.com/delaneyj/datastar"
	"github.com/dustin/go-humanize"
	"github.com/go-chi/chi/v5"
	"github.com/goccy/go-json"
	"github.com/gorilla/sessions"
	"github.com/samber/lo"
	"github.com/wcharczuk/go-chart/v2"
	"github.com/wcharczuk/go-chart/v2/drawing"
)

var homePageChartSVG string

func setupHome(router chi.Router, store sessions.Store) error {

	chartWidth := 480
	graph := chart.BarChart{
		Title:  "File Size (Hello World) first load",
		Width:  chartWidth,
		Height: chartWidth,
		Background: chart.Style{
			FillColor: drawing.Color{R: 1, G: 1, B: 1, A: 0},
			FontColor: drawing.ColorWhite,
		},
		Canvas: chart.Style{
			FillColor: drawing.Color{R: 1, G: 1, B: 1, A: 0},
			FontColor: drawing.ColorWhite,
			FontSize:  6,
		},
		TitleStyle: chart.Style{
			FontColor: drawing.ColorWhite,
		},
		XAxis: chart.Style{
			FontColor: drawing.ColorWhite,
		},
		YAxis: chart.YAxis{
			Style: chart.Style{
				FontColor: drawing.ColorWhite,
			},
			ValueFormatter: func(v any) string {
				return humanize.Bytes(uint64(v.(float64)))
			},
		},
		Bars: []chart.Value{
			{Label: "Next.js", Value: 86221},
			{Label: "SvelteKit", Value: 81920},
			{Label: "HTMX+\nhyperscript", Value: 40653},
			{Label: "HTMX+\nAlpine", Value: 37980},
			{Label: "Datastar", Value: 10445},
			{Label: "Datastar Core", Value: 4526},
		},
	}

	buffer := bytes.NewBuffer([]byte{})
	err := graph.Render(chart.SVG, buffer)
	if err != nil {
		panic(err)
	}
	homePageChartSVG = buffer.String()

	mvcStore := func(w http.ResponseWriter, r *http.Request) (*TodoMVC, *sessions.Session) {
		const key = "datastar-todos"
		session, err := store.Get(r, key)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return nil, nil
		}
		mvc, ok := session.Values["todos"].(*TodoMVC)
		if !ok {
			mvc = &TodoMVC{
				Mode: TodoViewModeAll,
				Todos: []*Todo{
					{Text: "Learn Go", Completed: true},
					{Text: "Learn Datastar", Completed: false},
					{Text: "???", Completed: false},
					{Text: "Profit", Completed: false},
				},
				EditingIdx: -1,
			}
			session.Values["todos"] = mvc
			session.Save(r, w)
		}

		return mvc, session
	}

	saveMVC := func(w http.ResponseWriter, r *http.Request, mvc *TodoMVC, session *sessions.Session) {
		session.Values["todos"] = mvc
		session.Save(r, w)
	}

	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		todoMVC, _ := mvcStore(w, r)
		Home(todoMVC).Render(r.Context(), w)
	})

	router.Route("/api", func(apiRouter chi.Router) {
		apiRouter.Route("/todos", func(todosRouter chi.Router) {
			todosRouter.Put("/mode/{mode}", func(w http.ResponseWriter, r *http.Request) {
				mvc, session := mvcStore(w, r)
				modeStr := chi.URLParam(r, "mode")
				modeRaw, err := strconv.Atoi(modeStr)
				if err != nil {
					http.Error(w, err.Error(), http.StatusBadRequest)
					return
				}

				mode := TodoViewMode(modeRaw)
				if mode < TodoViewModeAll || mode > TodoViewModeCompleted {
					http.Error(w, "invalid mode", http.StatusBadRequest)
					return
				}

				mvc.Mode = mode
				saveMVC(w, r, mvc, session)

				sse := datastar.NewSSE(w, r)
				datastar.RenderFragmentTempl(sse, TodosMVCView(mvc))
			})

			todosRouter.Route("/{idx}", func(todoRouter chi.Router) {
				routeIndex := func(w http.ResponseWriter, r *http.Request) (int, error) {
					idx := chi.URLParam(r, "idx")
					i, err := strconv.Atoi(idx)
					if err != nil {
						http.Error(w, err.Error(), http.StatusBadRequest)
						return 0, err
					}
					return i, nil
				}

				todoRouter.Post("/toggle", func(w http.ResponseWriter, r *http.Request) {
					mvc, session := mvcStore(w, r)
					i, err := routeIndex(w, r)
					if err != nil {
						return
					}

					if i < 0 {
						setCompletedTo := false
						for _, todo := range mvc.Todos {
							if !todo.Completed {
								setCompletedTo = true
								break
							}
						}
						for _, todo := range mvc.Todos {
							todo.Completed = setCompletedTo
						}
					} else {
						todo := mvc.Todos[i]
						todo.Completed = !todo.Completed
					}

					saveMVC(w, r, mvc, session)

					sse := datastar.NewSSE(w, r)
					datastar.RenderFragmentTempl(sse, TodosMVCView(mvc))
				})

				todoRouter.Route("/edit", func(editRouter chi.Router) {
					editRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
						mvc, session := mvcStore(w, r)
						i, err := routeIndex(w, r)
						if err != nil {
							return
						}

						mvc.EditingIdx = i
						saveMVC(w, r, mvc, session)

						sse := datastar.NewSSE(w, r)
						datastar.RenderFragmentTempl(sse, TodosMVCView(mvc))
					})

					editRouter.Put("/", func(w http.ResponseWriter, r *http.Request) {
						type Store struct {
							Input string `json:"input"`
						}
						store := &Store{}

						if err := datastar.BodyUnmarshal(r, store); err != nil {
							http.Error(w, err.Error(), http.StatusBadRequest)
							return
						}

						mvc, session := mvcStore(w, r)
						i, err := routeIndex(w, r)
						if err != nil {
							return
						}

						if i >= 0 && i < len(mvc.Todos) {
							mvc.Todos[i].Text = store.Input
						} else {
							mvc.Todos = append(mvc.Todos, &Todo{
								Text:      store.Input,
								Completed: false,
							})
						}
						mvc.EditingIdx = -1

						saveMVC(w, r, mvc, session)

						sse := datastar.NewSSE(w, r)
						datastar.RenderFragmentTempl(sse, TodosMVCView(mvc))
					})
				})

				todoRouter.Delete("/", func(w http.ResponseWriter, r *http.Request) {
					i, err := routeIndex(w, r)
					if err != nil {
						return
					}

					mvc, session := mvcStore(w, r)

					if i >= 0 && i < len(mvc.Todos) {
						mvc.Todos = append(mvc.Todos[:i], mvc.Todos[i+1:]...)
					} else {
						mvc.Todos = lo.Filter(mvc.Todos, func(todo *Todo, i int) bool {
							return !todo.Completed
						})
					}
					saveMVC(w, r, mvc, session)

					sse := datastar.NewSSE(w, r)
					datastar.RenderFragmentTempl(sse, TodosMVCView(mvc))
				})
			})
		})
	})

	return nil
}

func MustJSONMarshal(v any) string {
	b, err := json.MarshalIndent(v, "", " ")
	if err != nil {
		panic(err)
	}
	return string(b)
}
