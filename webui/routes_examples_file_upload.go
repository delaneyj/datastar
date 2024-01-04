package webui

import (
	"context"
	"crypto/sha256"
	"net/http"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	"github.com/dustin/go-humanize"
	"github.com/go-chi/chi/v5"
)

func setupExamplesFileUpload(ctx context.Context, examplesRouter chi.Router) error {
	examplesRouter.Route("/file_upload", func(lazyLoadRouter chi.Router) {
		lazyLoadRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		type Store struct {
			File     []byte `json:"file"`
			FileMime string `json:"fileMime"`
			FileName string `json:"fileName"`
		}

		lazyLoadRouter.Get("/data", func(w http.ResponseWriter, r *http.Request) {
			store := &Store{
				File: []byte(""),
			}
			sse := toolbelt.NewSSE(w, r)
			datastar.RenderFragment(
				sse,
				DIV().
					ID("file_upload").
					CLASS("flex flex-col gap-4").
					DATASTAR_MERGE_STORE(store).
					Children(
						DIV().
							CLASS("form-control").
							Children(
								LABEL().
									CLASS("label").
									Children(
										SPAN().
											CLASS("label-text").
											Text("Pick anything reasonably sized"),
									),
								INPUT().
									TYPE("file").
									CLASS("file-input file-input-bordered").
									DATASTAR_MODEL("file"),
							),
						BUTTON().
							CLASS("btn btn-primary").
							Text("Submit").
							DATASTAR_FETCH_URL("'/examples/file_upload/upload'").
							DATASTAR_ON("click", datastar.POST_ACTION),
					),
			)
		})

		lazyLoadRouter.Post("/upload", func(w http.ResponseWriter, r *http.Request) {
			r.Body = http.MaxBytesReader(w, r.Body, 64*1024*1024)
			sse := toolbelt.NewSSE(w, r)

			store := &Store{}
			if err := datastar.BodyUnmarshal(r, store); err != nil {
				datastar.RenderFragment(
					sse,
					DIV().
						ID("file_upload").
						CLASS("alert alert-error").
						Children(
							material_symbols.ErrorIcon(),
							TextF("Error: %s", err),
						),
				)
				return
			}

			sha256Hash := sha256.Sum256(store.File)
			fileBytesLen := uint64(len(store.File))
			datastar.RenderFragment(
				sse,
				DIV().
					ID("file_upload").
					CLASS("card bg-base-300").
					Children(
						DIV().
							CLASS("card-body").
							Children(
								TABLE().
									CLASS("table table-zebra").
									Children(
										CAPTION(Text("File Upload Results")),
										TBODY().
											Children(
												TR(TH(Text("File Name")), TD(Text(store.FileName))),
												TR(TH(Text("File Size")), TD(Text(humanize.Bytes(fileBytesLen)))),
												TR(TH(Text("File Mime")), TD(Text(store.FileMime))),
												TR(
													TH(Text("SHA256 Hash")),
													TD().CLASS("text-ellipsis overflow-hidden").TextF("%x", sha256Hash),
												),
											),
									),
							),
					),
			)
		})
	})

	return nil
}
