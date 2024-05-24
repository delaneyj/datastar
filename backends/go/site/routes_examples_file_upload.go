package site

import (
	"encoding/base64"

	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/dustin/go-humanize"
	"github.com/go-chi/chi/v5"
	"github.com/goccy/go-json"
	"github.com/zeebo/xxh3"
)

func setupExamplesFileUpload(examplesRouter chi.Router) error {
	type Store struct {
		FilesBase64 []string `json:"files"`
		FileMimes   []string `json:"filesMimes"`
		FileNames   []string `json:"filesNames"`
	}

	examplesRouter.Get("/file_upload/data", func(w http.ResponseWriter, r *http.Request) {
		store := &Store{
			FilesBase64: []string{},
			FileMimes:   []string{},
			FileNames:   []string{},
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
						CLASS("flex flex-col gap-2").
						Children(
							LABEL().
								CLASS("block mb-2 text-sm font-medium text-primary-100").
								FOR("file_input").
								Text("Pick anything reasonably sized"),
							INPUT().
								ID("file_input").
								TYPE("file").
								DATASTAR_MODEL("files").
								MULTIPLE().
								CLASS("block w-full text-sm border rounded-lg cursor-pointer text-primary-400 focus:outline-none bg-primary-700 border-primary-600 placeholder-primary-500"),
						),
					BUTTON().
						CLASS("bg-primary-300 hover:bg-primary-400 text-primary-800 font-bold py-2 px-4 rounded-l").
						Text("Submit").
						DATASTAR_ON("click", datastar.POST("/examples/file_upload/upload")),

					PRE().DATASTAR_TEXT("JSON.stringify(ctx.store().value,null,2)"),
				),
		)
	})

	examplesRouter.Post("/file_upload/upload", func(w http.ResponseWriter, r *http.Request) {
		maxBytesSize := 4 * 1024 * 1024
		r.Body = http.MaxBytesReader(w, r.Body, int64(maxBytesSize))
		data, err := io.ReadAll(r.Body)
		if err != nil {
			return
		}

		if len(data) >= maxBytesSize {
			sse := datastar.NewSSE(w, r)
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

		store := &Store{}
		sse := datastar.NewSSE(w, r)
		if err := json.Unmarshal(data, store); err != nil {
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

		files := make([][]byte, len(store.FilesBase64))
		for i, file := range store.FilesBase64 {
			data, err := base64.StdEncoding.DecodeString(file)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			files[i] = data
		}

		humanizedHashes := make([]string, len(files))
		humainzeByteCount := make([]string, len(files))
		for i, file := range files {
			h := xxh3.Hash(file)
			humanizedHashes[i] = fmt.Sprintf("%x", h)
			humainzeByteCount[i] = humanize.Bytes(uint64(len(file)))
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
											TR(TH(Text("File Names")), TD(Text(strings.Join(store.FileNames, ", ")))),
											TR(TH(Text("File Sizes")), TD(Text(strings.Join(humainzeByteCount, ", ")))),
											TR(TH(Text("File Mimes")), TD(Text(strings.Join(store.FileMimes, ", ")))),
											TR(
												TH(Text("XXH3 Hashes")),
												TD().CLASS("text-ellipsis overflow-hidden").TextF(strings.Join(humanizedHashes, ", ")),
											),
										),
								),
						),
				),
		)
	})

	return nil
}
