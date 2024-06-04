package datastar

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/a-h/templ"
	"github.com/delaneyj/gostar/elements"
	"github.com/go-sanitize/sanitize"
	"github.com/goccy/go-json"
	"github.com/valyala/bytebufferpool"
)

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
	if _, err := buf.ReadFrom(r.Body); err != nil {
		return fmt.Errorf("failed to read body: %w", err)
	}
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

func GET(urlFormat string, args ...any) string {
	return fmt.Sprintf(`$$get('%s')`, fmt.Sprintf(urlFormat, args...))
}
func POST(urlFormat string, args ...any) string {
	return fmt.Sprintf(`$$post('%s')`, fmt.Sprintf(urlFormat, args...))
}
func PUT(urlFormat string, args ...any) string {
	return fmt.Sprintf(`$$put('%s')`, fmt.Sprintf(urlFormat, args...))
}
func PATCH(urlFormat string, args ...any) string {
	return fmt.Sprintf(`$$patch('%s')`, fmt.Sprintf(urlFormat, args...))
}
func DELETE(urlFormat string, args ...any) string {
	return fmt.Sprintf(`$$delete('%s')`, fmt.Sprintf(urlFormat, args...))
}

type FragmentMergeType string

const (
	FragmentMergeMorphElement     FragmentMergeType = "morph_element"
	FragmentMergeInnerElement     FragmentMergeType = "inner_element"
	FragmentMergeOuterElement     FragmentMergeType = "outer_element"
	FragmentMergePrependElement   FragmentMergeType = "prepend_element"
	FragmentMergeAppendElement    FragmentMergeType = "append_element"
	FragmentMergeBeforeElement    FragmentMergeType = "before_element"
	FragmentMergeAfterElement     FragmentMergeType = "after_element"
	FragmentMergeDeleteElement    FragmentMergeType = "delete_element"
	FragmentMergeUpsertAttributes FragmentMergeType = "upsert_attributes"
)

var ValidFragmentMergeTypes = []FragmentMergeType{
	FragmentMergeMorphElement,
	FragmentMergeInnerElement,
	FragmentMergeOuterElement,
	FragmentMergePrependElement,
	FragmentMergeAppendElement,
	FragmentMergeBeforeElement,
	FragmentMergeAfterElement,
	FragmentMergeDeleteElement,
	FragmentMergeUpsertAttributes,
}

const (
	FragmentSelectorSelf  = "self"
	FragmentSelectorUseID = ""
	SSEEventTypeFragment  = "datastar-fragment"
	SSEEventTypeSignal    = "datastar-signal"
	SSEEventTypeRedirect  = "datastar-redirect"
	SSEEventTypeError     = "datastar-error"
)

type RenderFragmentOptions struct {
	QuerySelector  string
	Merge          FragmentMergeType
	SettleDuration time.Duration
}
type RenderFragmentOption func(*RenderFragmentOptions)

func WithQuerySelector(selector string) RenderFragmentOption {
	return func(o *RenderFragmentOptions) {
		o.QuerySelector = selector
	}
}

func WithMergeType(merge FragmentMergeType) RenderFragmentOption {
	return func(o *RenderFragmentOptions) {
		o.Merge = merge
	}
}

func WithMergeInnerElement() RenderFragmentOption {
	return WithMergeType(FragmentMergeInnerElement)
}

func WithMergeOuterElement() RenderFragmentOption {
	return WithMergeType(FragmentMergeOuterElement)
}

func WithMergePrependElement() RenderFragmentOption {
	return WithMergeType(FragmentMergePrependElement)
}

func WithMergeAppendElement() RenderFragmentOption {
	return WithMergeType(FragmentMergeAppendElement)
}

func WithMergeBeforeElement() RenderFragmentOption {
	return WithMergeType(FragmentMergeBeforeElement)
}

func WithMergeAfterElement() RenderFragmentOption {
	return WithMergeType(FragmentMergeAfterElement)
}

func WithMergeDeleteElement() RenderFragmentOption {
	return WithMergeType(FragmentMergeDeleteElement)
}

func WithMergeUpsertAttributes() RenderFragmentOption {
	return WithMergeType(FragmentMergeUpsertAttributes)
}

func WithSettleDuration(d time.Duration) RenderFragmentOption {
	return func(o *RenderFragmentOptions) {
		o.SettleDuration = d
	}
}

func WithQuerySelectorF(format string, args ...any) RenderFragmentOption {
	return WithQuerySelector(fmt.Sprintf(format, args...))
}

func WithQuerySelectorID(id string) RenderFragmentOption {
	return WithQuerySelectorF("#%s", id)
}

func WithQuerySelectorSelf() RenderFragmentOption {
	return WithQuerySelector(FragmentSelectorSelf)
}

func WithQuerySelectorUseID() RenderFragmentOption {
	return WithQuerySelector(FragmentSelectorUseID)
}

func Delete(sse *ServerSentEventsHandler, selector string, opts ...RenderFragmentOption) {
	opts = append([]RenderFragmentOption{
		WithMergeDeleteElement(),
		WithQuerySelector(selector),
	}, opts...)
	RenderFragmentString(
		sse,
		"",
		opts...,
	)
}

func RenderFragmentTempl(sse *ServerSentEventsHandler, c templ.Component, opts ...RenderFragmentOption) error {
	sb := &strings.Builder{}
	if err := c.Render(sse.Context(), sb); err != nil {
		return fmt.Errorf("failed to render fragment: %w", err)
	}
	if err := RenderFragmentString(sse, sb.String(), opts...); err != nil {
		return fmt.Errorf("failed to render fragment: %w", err)
	}
	return nil
}

func RenderFragmentGostar(sse *ServerSentEventsHandler, child elements.ElementRenderer, opts ...RenderFragmentOption) error {
	buf := bytebufferpool.Get()
	defer bytebufferpool.Put(buf)
	if err := child.Render(buf); err != nil {
		return fmt.Errorf("failed to render: %w", err)
	}

	return RenderFragmentString(sse, buf.String(), opts...)
}

func RenderFragmentString(sse *ServerSentEventsHandler, fragment string, opts ...RenderFragmentOption) error {
	options := &RenderFragmentOptions{
		QuerySelector:  FragmentSelectorUseID,
		Merge:          FragmentMergeMorphElement,
		SettleDuration: 500 * time.Millisecond,
	}
	for _, opt := range opts {
		opt(options)
	}

	dataRows := []string{}
	if options.QuerySelector != "" {
		dataRows = append(dataRows, fmt.Sprintf("selector %s", options.QuerySelector))
	}
	if options.Merge != "" {
		dataRows = append(dataRows, fmt.Sprintf("merge %s", options.Merge))
	}
	if options.SettleDuration > 0 {
		dataRows = append(dataRows, fmt.Sprintf("settle %d", options.SettleDuration.Milliseconds()))
	}
	if fragment != "" {
		parts := strings.Split(fragment, "\n")
		parts[0] = "fragment " + parts[0]
		dataRows = append(dataRows, parts...)
	}

	// log.Printf("datastar: %s", strings.Join(dataRows, "\n"))

	sse.SendMultiData(
		dataRows,
		WithSSEEvent(SSEEventTypeFragment),
		WithSSERetry(0),
	)
	return nil
}

func Redirect(sse *ServerSentEventsHandler, url string) {
	sse.Send(
		fmt.Sprintf("redirect %s", url),
		WithSSEEvent(SSEEventTypeRedirect),
		WithSSERetry(0),
	)
}

func PatchStore(sse *ServerSentEventsHandler, store any) {
	b, err := json.Marshal(store)
	if err != nil {
		panic(err)
	}
	sse.Send(
		string(b),
		WithSSEEvent(SSEEventTypeSignal),
	)
}

func RedirectF(sse *ServerSentEventsHandler, urlFormat string, args ...interface{}) {
	Redirect(sse, fmt.Sprintf(urlFormat, args...))
}

func Error(sse *ServerSentEventsHandler, err error) {
	sse.Send(
		fmt.Sprintf("error %s", err.Error()),
		WithSSEEvent(SSEEventTypeError),
		WithSSERetry(0),
	)
}

func ErrorF(sse *ServerSentEventsHandler, format string, args ...interface{}) {
	Error(sse, fmt.Errorf(format, args...))
}

func MustJSON(v any) string {
	b, err := json.Marshal(v)
	if err != nil {
		panic(err)
	}
	return string(b)
}
