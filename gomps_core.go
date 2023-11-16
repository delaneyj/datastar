package datastar

import (
	"fmt"
	"net/http"

	"github.com/delaneyj/toolbelt/gomps"
	"github.com/go-sanitize/sanitize"
	"github.com/goccy/go-json"
	"github.com/valyala/bytebufferpool"
)

func MergeStore(m any) gomps.NODE {
	b, err := json.Marshal(m)
	if err != nil {
		panic(err)
	}
	return gomps.DATA("merge-store", string(b))
}

func QueryStringUnmarshal(r *http.Request, store any) error {
	dsJSON := r.URL.Query().Get("datastar")
	if dsJSON != "" {
		if err := json.Unmarshal([]byte(dsJSON), store); err != nil {
			return fmt.Errorf("failed to unmarshal: %w", err)
		}
	}

	return nil
}

func BodyUnmarshal(r *http.Request, store any) error {
	buf := bytebufferpool.Get()
	defer bytebufferpool.Put(buf)
	buf.ReadFrom(r.Body)
	b := buf.Bytes()

	if err := json.Unmarshal(b, store); err != nil {
		return fmt.Errorf("failed to unmarshal: %w", err)
	}

	return nil
}

func BodySanitize(r *http.Request, sanitizer *sanitize.Sanitizer, store any) error {
	if err := BodyUnmarshal(r, store); err != nil {
		return fmt.Errorf("failed to unmarshal: %w", err)
	}
	if err := sanitizer.Sanitize(store); err != nil {
		return fmt.Errorf("failed to sanitize: %w", err)
	}
	return nil
}

func Ref(name string) gomps.NODE {
	return gomps.DATA("ref", name)
}
