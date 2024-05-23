package site

import (
	"crypto/sha256"
	"net/http"
	"strings"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/dustin/go-humanize"
	"github.com/go-chi/chi/v5"
)

func setupExamplesFileUpload(examplesRouter chi.Router) error {
	type Store struct {
		Files     [][]byte `json:"file"`
		FileMimes []string `json:"fileMimes"`
		FileNames []string `json:"fileNames"`
	}

	examplesRouter.Get("/file_upload/data", func(w http.ResponseWriter, r *http.Request) {
		store := &Store{}
		sse := datastar.NewSSE(w, r)
		datastar.RenderFragment(
			sse,
			DIV().
				ID("file_upload").
				CLASS("flex flex-col gap-4").
				DATASTAR_STORE(store).
				Children(
					DIV().
						CLASS("flex flex-col gap-2").
						Children(
							LABEL().
								CLASS("block mb-2 text-sm font-medium text-primary-100").
								FOR("file_input").
								Text("Pick anything reasonably sized"),
							INPUT().
								ID("file_input").
								TYPE("file").
								DATASTAR_MODEL("file").
								MULTIPLE().
								CLASS("block w-full text-sm border rounded-lg cursor-pointer text-primary-400 focus:outline-none bg-primary-700 border-primary-600 placeholder-primary-500"),
						),
					BUTTON().
						CLASS("bg-primary-300 hover:bg-primary-400 text-primary-800 font-bold py-2 px-4 rounded-l").
						Text("Submit").
						DATASTAR_ON("click", datastar.POST("/examples/file_upload/upload")),
				),
		)
	})

	examplesRouter.Post("/file_upload/upload", func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 64*1024*1024)
		store := &Store{}
		err := datastar.BodyUnmarshal(r, store)

		sse := datastar.NewSSE(w, r)
		if err != nil {
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

		h := sha256.New()
		fileBytesLen := uint64(0)
		for _, file := range store.Files {
			h.Write(file)
			fileBytesLen += uint64(len(file))
		}
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
											TR(TH(Text("File Names")), TD(Text(strings.Join(store.FileNames, ",")))),
											TR(TH(Text("File Sizes")), TD(Text(humanize.Bytes(fileBytesLen))),
												TR(TH(Text("File Mimes")), TD(Text(strings.Join(store.FileMimes, ",")))),
												TR(
													TH(Text("SHA256 Hash")),
													TD().CLASS("text-ellipsis overflow-hidden").TextF("%x", h.Sum(nil)),
												),
											),
										),
								),
						),
				),
		)
	})

	return nil
}