package site

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/delaneyj/toolbelt"
	"github.com/delaneyj/toolbelt/embeddednats"
	"github.com/go-chi/chi/v5"
	"github.com/goccy/go-json"
	"github.com/nats-io/nats.go/jetstream"
	datastar "github.com/starfederation/datastar/code/go/sdk"
	"github.com/zeebo/xxh3"
)

type MouseXY struct {
	X  int       `json:"x"`
	Y  int       `json:"y"`
	At time.Time `json:"at"`
}

type MouseXYCollection struct {
	Positions map[string]MouseXY `json:"positions"`
}

func setupExamplesMousemove(setupCtx context.Context, examplesRouter chi.Router, ns *embeddednats.Server) error {
	nc, err := ns.Client()
	if err != nil {
		return fmt.Errorf("error creating nats client: %w", err)
	}
	js, err := jetstream.New(nc)
	if err != nil {
		return fmt.Errorf("error creating jetstream client: %w", err)
	}
	kv, err := js.CreateOrUpdateKeyValue(setupCtx, jetstream.KeyValueConfig{
		Bucket:      "cursors",
		Description: "Mouse cursor positions",
		Compression: true,
		TTL:         time.Hour,
		MaxBytes:    16 * 1024 * 1024,
	})
	if err != nil {
		return fmt.Errorf("error creating key value: %w", err)
	}
	const key = "allCursors"
	kv.PutString(setupCtx, key, `{"positions": {}}`)

	const maxTime = 3 * time.Second

	decodeCursors := func(entry jetstream.KeyValueEntry) (*MouseXYCollection, error) {
		cursors := &MouseXYCollection{}
		if err := json.Unmarshal(entry.Value(), cursors); err != nil {
			return nil, fmt.Errorf("failed to unmarshal cursors: %w", err)
		}
		return cursors, nil
	}

	cursors := func(ctx context.Context) (*MouseXYCollection, uint64, error) {
		entry, err := kv.Get(ctx, key)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to get key value: %w", err)
		}

		cursors, err := decodeCursors(entry)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to decode cursors: %w", err)
		}

		return cursors, entry.Revision(), nil
	}

	updateCursors := func(ctx context.Context, id string, cursor MouseXY) error {
		cursors, rev, err := cursors(ctx)
		if err != nil {
			return fmt.Errorf("failed to get cursors: %w", err)
		}

		cursors.Positions[id] = cursor

		now := time.Now()
		for id, cursor := range cursors.Positions {
			if now.Sub(cursor.At) > maxTime {
				delete(cursors.Positions, id)
			}
		}

		b, err := json.Marshal(cursors)
		if err != nil {
			return fmt.Errorf("failed to marshal mvc: %w", err)
		}

		kv.Update(ctx, key, b, rev)

		return nil
	}

	examplesRouter.Route("/mouse_move/updates", func(updatesRouter chi.Router) {
		// updatesRouter.Use(
		// 	httprate.LimitByIP(2, time.Second),
		// )
		updatesRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)

			id := fmt.Sprintf("%x", xxh3.HashString(toolbelt.NextEncodedID()))

			ctx := r.Context()
			collection, _, err := cursors(ctx)
			if err != nil {
				sse.ConsoleError(err)
				return
			}

			sse.MergeFragmentTempl(MouseMouseUI(id, collection))

			watcher, err := kv.Watch(ctx, key)
			if err != nil {
				sse.ConsoleError(err)
				return
			}
			defer watcher.Stop()

			for {
				select {
				case <-ctx.Done():
					return
				case entry := <-watcher.Updates():
					if entry == nil {
						continue
					}
					collection, err := decodeCursors(entry)
					if err != nil {
						sse.ConsoleError(err)
						return
					}

					sse.MergeFragmentTempl(cursorSVG(collection.Positions))
				}
			}

		})

		updatesRouter.Put("/", func(w http.ResponseWriter, r *http.Request) {
			type Form struct {
				ID string `json:"id"`
				X  int    `json:"x"`
				Y  int    `json:"y"`
			}
			form := &Form{}
			if err := datastar.ReadSignals(r, form); err != nil {
				datastar.NewSSE(w, r).ConsoleError(err)
				return
			}

			// log.Printf("Received mouse move: %+v", form)

			updateCursors(r.Context(), form.ID, MouseXY{
				X:  form.X,
				Y:  form.Y,
				At: time.Now(),
			})

		})
	})

	return nil
}
