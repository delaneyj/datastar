package site

import (
	"crypto/sha256"
	"net/http"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/dustin/go-humanize"
	"github.com/go-chi/chi/v5"
)

func setupExamplesFileUpload(examplesRouter chi.Router) error {
	type Store struct {
		File     []byte `json:"file"`
		FileMime string `json:"fileMime"`
		FileName string `json:"fileName"`
	}

	examplesRouter.Get("/file_upload/data", func(w http.ResponseWriter, r *http.Request) {
		store := &Store{
			File: []byte(""),
		}
		sse := datastar.NewSSE(w, r)
		datastar.RenderFragment(
			sse,
			DIV().
				ID("file_upload").
				CLASS("flex flex-col gap-4").
				DATASTAR_STORE(store).
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
						DATASTAR_ON("click", datastar.POST("/examples/file_upload/upload")),
				),
		)
	})

	examplesRouter.Post("/file_upload/upload", func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 64*1024*1024)
		sse := datastar.NewSSE(w, r)

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

	return nil
}
