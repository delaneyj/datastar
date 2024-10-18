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
	FragmentMergeMorph   FragmentMergeType = "morph"
	FragmentMergeInner   FragmentMergeType = "inner"
	FragmentMergeOuter   FragmentMergeType = "outer"
	FragmentMergePrepend FragmentMergeType = "prepend"
	FragmentMergeAppend  FragmentMergeType = "append"
	FragmentMergeBefore  FragmentMergeType = "before"
	FragmentMergeAfter   FragmentMergeType = "after"
	FragmentMergeUpsert  FragmentMergeType = "upsert_attributes"
)

var ValidFragmentMergeTypes = []FragmentMergeType{
	FragmentMergeMorph,
	FragmentMergeInner,
	FragmentMergeOuter,
	FragmentMergePrepend,
	FragmentMergeAppend,
	FragmentMergeBefore,
	FragmentMergeAfter,
	FragmentMergeUpsert,
}

const (
	FragmentSelectorSelf  = "self"
	FragmentSelectorUseID = ""
	SSEEventTypeFragment  = "datastar-fragment"
	SSEEventTypeSignal    = "datastar-signal"
	SSEEventTypeRemove    = "datastar-remove"
	SSEEventTypeRedirect  = "datastar-redirect"
	SSEEventTypeConsole   = "datastar-console"
)

type RenderFragmentOptions struct {
	QuerySelector      string
	Merge              FragmentMergeType
	SettleDuration     time.Duration
	UseViewTransitions *bool
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

func WithMergeMorph() RenderFragmentOption {
	return WithMergeType(FragmentMergeMorph)
}

func WithMergePrepend() RenderFragmentOption {
	return WithMergeType(FragmentMergePrepend)
}

func WithMergeAppend() RenderFragmentOption {
	return WithMergeType(FragmentMergeAppend)
}

func WithMergeBefore() RenderFragmentOption {
	return WithMergeType(FragmentMergeBefore)
}

func WithMergeAfter() RenderFragmentOption {
	return WithMergeType(FragmentMergeAfter)
}

func WithMergeUpsertAttributes() RenderFragmentOption {
	return WithMergeType(FragmentMergeUpsert)
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

func WithViewTransitions() RenderFragmentOption {
	return func(o *RenderFragmentOptions) {
		var b = true
		o.UseViewTransitions = &b
	}
}

func WithoutViewTransitions() RenderFragmentOption {
	return func(o *RenderFragmentOptions) {
		var b = false
		o.UseViewTransitions = &b
	}
}

func Remove(sse *ServerSentEventsHandler, selector string, opts ...RenderFragmentOption) {

	if selector == "" {
		panic("missing selector")
	}

	dataRows := []string{fmt.Sprintf("selector %s", selector)}

	sse.SendMultiData(dataRows, WithSSEEvent(SSEEventTypeRemove))
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

const defaultSettleDuration = 500 * time.Millisecond

func RenderFragmentString(sse *ServerSentEventsHandler, fragment string, opts ...RenderFragmentOption) error {
	options := &RenderFragmentOptions{
		QuerySelector:  FragmentSelectorUseID,
		Merge:          FragmentMergeMorph,
		SettleDuration: defaultSettleDuration,
	}
	for _, opt := range opts {
		opt(options)
	}

	dataRows := make([]string, 0, 4)
	if options.QuerySelector != FragmentSelectorUseID {
		dataRows = append(dataRows, fmt.Sprintf("selector %s", options.QuerySelector))
	}
	if options.Merge != FragmentMergeMorph {
		dataRows = append(dataRows, fmt.Sprintf("merge %s", options.Merge))
	}
	if options.SettleDuration > 0 && options.SettleDuration != defaultSettleDuration {
		dataRows = append(dataRows, fmt.Sprintf("settle %d", options.SettleDuration.Milliseconds()))
	}
	if options.UseViewTransitions != nil {
		dataRows = append(dataRows, fmt.Sprintf("vt %t", *options.UseViewTransitions))
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
	PatchStoreRaw(sse, string(b))
}

type PatchStoreOptions struct {
	OnlyIfMissing bool
}

type PatchStoreOption func(*PatchStoreOptions)

func WithIfMissing() PatchStoreOption {
	return func(o *PatchStoreOptions) {
		o.OnlyIfMissing = true
	}
}

func PatchStoreRaw(sse *ServerSentEventsHandler, storeJSON string, opts ...PatchStoreOption) {
	options := &PatchStoreOptions{
		OnlyIfMissing: false,
	}
	for _, opt := range opts {
		opt(options)
	}

	dataRows := make([]string, 0, 32)
	if options.OnlyIfMissing {
		dataRows = append(dataRows, fmt.Sprintf("onlyIfMissing %t", options.OnlyIfMissing))
	}
	lines := strings.Split(storeJSON, "\n")
	for _, line := range lines {
		dataRows = append(dataRows, fmt.Sprintf("store %s", line))
	}

	sse.SendMultiData(
		dataRows,
		WithSSEEvent(SSEEventTypeSignal),
	)
}

func PatchStoreIfMissing(sse *ServerSentEventsHandler, store any) {
	b, err := json.Marshal(store)
	if err != nil {
		panic(err)
	}
	PatchStoreIfMissingRaw(sse, string(b))
}

func PatchStoreIfMissingRaw(sse *ServerSentEventsHandler, storeJSON string) {
	PatchStoreRaw(sse, storeJSON, WithIfMissing())
}

func RedirectF(sse *ServerSentEventsHandler, urlFormat string, args ...interface{}) {
	Redirect(sse, fmt.Sprintf(urlFormat, args...))
}

type ConsoleLogMode string

const (
	ConsoleLogModeLog      ConsoleLogMode = "log"
	ConsoleLogModeError    ConsoleLogMode = "error"
	ConsoleLogModeWarn     ConsoleLogMode = "warn"
	ConsoleLogModeInfo     ConsoleLogMode = "info"
	ConsoleLogModeDebug    ConsoleLogMode = "debug"
	ConsoleLogModeGroup    ConsoleLogMode = "group"
	ConsoleLogModeGroupEnd ConsoleLogMode = "groupEnd"
)

func Console(sse *ServerSentEventsHandler, Mode ConsoleLogMode, message string) {
	sse.Send(
		fmt.Sprintf("%s %s", Mode, message),
		WithSSEEvent(SSEEventTypeConsole),
	)
}

func ConsoleF(sse *ServerSentEventsHandler, Mode ConsoleLogMode, format string, args ...interface{}) {
	Console(sse, Mode, fmt.Sprintf(format, args...))
}

func Error(sse *ServerSentEventsHandler, err error) {
	Console(sse, ConsoleLogModeError, err.Error())
}

func ConsoleLogF(sse *ServerSentEventsHandler, format string, args ...interface{}) {
	ConsoleF(sse, ConsoleLogModeLog, format, args...)
}

func ConsoleErrorF(sse *ServerSentEventsHandler, format string, args ...interface{}) {
	ConsoleF(sse, ConsoleLogModeError, format, args...)
}

func ConsoleWarnF(sse *ServerSentEventsHandler, format string, args ...interface{}) {
	ConsoleF(sse, ConsoleLogModeWarn, format, args...)
}

func ConsoleInfoF(sse *ServerSentEventsHandler, format string, args ...interface{}) {
	ConsoleF(sse, ConsoleLogModeInfo, format, args...)
}

func ConsoleDebugF(sse *ServerSentEventsHandler, format string, args ...interface{}) {
	ConsoleF(sse, ConsoleLogModeDebug, format, args...)
}

func ConsoleGroup(sse *ServerSentEventsHandler, label string) {
	Console(sse, ConsoleLogModeGroup, label)
}

func ConsoleGroupEnd(sse *ServerSentEventsHandler) {
	Console(sse, ConsoleLogModeGroupEnd, "")
}
