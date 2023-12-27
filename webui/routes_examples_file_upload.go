package webui

import (
	"context"
	"crypto/sha256"
	"net/http"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	. "github.com/delaneyj/gostar/elements"
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
				DIV(
					ID("file_upload"),
					CLS("flex flex-col gap-4"),
					datastar.MergeStore(store),
					DIV(
						CLS("form-control"),
						LABEL(
							CLS("label"),
							SPAN(
								CLS("label-text"),
								TXT("Pick anything reasonably sized"),
							),
						),
						INPUT(
							TYPE("file"),
							CLS("file-input file-input-bordered"),
							datastar.Model("file"),
						),
					),
					BUTTON(
						CLS("btn btn-primary"),
						TXT("Submit"),
						datastar.FetchURL("'/examples/file_upload/upload'"),
						datastar.On("click", datastar.POST_ACTION),
					),
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
					DIV(
						ID("file_upload"),
						CLS("alert alert-error"),
						material_symbols.Error(),
						TXTF("Error: %s", err),
					),
				)
				return
			}

			sha256Hash := sha256.Sum256(store.File)
			fileBytesLen := uint64(len(store.File))
			datastar.RenderFragment(
				sse,
				DIV(
					ID("file_upload"),
					CLS("card bg-base-300"),
					DIV(
						CLS("card-body"),
						TABLE(
							CLS("table table-zebra"),
							CAPTION(TXT("File Upload Results")),
							TBODY(
								TR(TH(TXT("File Name")), TD(TXT(store.FileName))),
								TR(TH(TXT("File Size")), TD(TXT(humanize.Bytes(fileBytesLen)))),
								TR(TH(TXT("File Mime")), TD(TXT(store.FileMime))),
								TR(
									TH(TXT("SHA256 Hash")),
									TD(
										CLS("text-ellipsis overflow-hidden"),
										TXTF("%x", sha256Hash),
									),
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
