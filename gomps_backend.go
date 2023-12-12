package datastar

import (
	"fmt"
	"time"

	"github.com/delaneyj/toolbelt"
	"github.com/delaneyj/toolbelt/gomps"
	"github.com/valyala/bytebufferpool"
)

const (
	GET_ACTION    = "$$get"
	POST_ACTION   = "$$post"
	PUT_ACTION    = "$$put"
	PATCH_ACTION  = "$$patch"
	DELETE_ACTION = "$$delete"
)

func Header(header, expression string) gomps.NODE {
	return gomps.DATA("header-"+toolbelt.Kebab(header), expression)
}

func FetchURL(expression string) gomps.NODE {
	return gomps.DATA("fetch-url", expression)
}

func FetchURLF(format string, args ...interface{}) gomps.NODE {
	return FetchURL(fmt.Sprintf(format, args...))
}

func FetchIndicator(expression string) gomps.NODE {
	return gomps.DATA("fetch-indicator", expression)
}

func FetchIndicatorF(format string, args ...interface{}) gomps.NODE {
	return FetchIndicator(fmt.Sprintf(format, args...))
}

func FetchIndicatorID(id string) gomps.NODE {
	return FetchIndicatorF("'#%s'", id)
}

func ServerSentEvents(expression string) gomps.NODE {
	return gomps.DATA("sse", fmt.Sprintf(`'%s'`, expression))
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

const (
	FragmentSelectorSelf  = "self"
	FragmentSelectorUseID = ""
	SSEEventTypeFragment  = "datastar-fragment"
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

func UpsertStore(sse *toolbelt.ServerSentEventsHandler, store any, opts ...RenderFragmentOption) {
	opts = append([]RenderFragmentOption{WithMergeUpsertAttributes()}, opts...)
	RenderFragment(
		sse,
		gomps.DIV(MergeStore(store)),
		opts...,
	)
}

func Delete(sse *toolbelt.ServerSentEventsHandler, selector string, opts ...RenderFragmentOption) {
	opts = append([]RenderFragmentOption{
		WithMergeDeleteElement(),
		WithQuerySelector(selector),
	}, opts...)
	RenderFragment(
		sse,
		gomps.DIV(),
		opts...,
	)
}

func RenderFragment(sse *toolbelt.ServerSentEventsHandler, child gomps.NODE, opts ...RenderFragmentOption) error {
	options := &RenderFragmentOptions{
		QuerySelector:  FragmentSelectorUseID,
		Merge:          FragmentMergeMorphElement,
		SettleDuration: 0,
	}
	for _, opt := range opts {
		opt(options)
	}

	buf := bytebufferpool.Get()
	defer bytebufferpool.Put(buf)
	if err := child.Render(buf); err != nil {
		return fmt.Errorf("failed to render: %w", err)
	}

	dataRows := []string{
		fmt.Sprintf("selector %s", options.QuerySelector),
		fmt.Sprintf("merge %s", options.Merge),
		fmt.Sprintf("settle %d", options.SettleDuration.Milliseconds()),
		fmt.Sprintf("fragment %s", buf.String()),
	}

	// log.Printf("datastar: %s", strings.Join(dataRows, "\n"))

	sse.SendMultiData(
		dataRows,
		toolbelt.WithSSEEvent(SSEEventTypeFragment),
		toolbelt.WithSSERetry(0),
		toolbelt.WithSSESkipMinBytesCheck(true),
	)
	return nil
}

func RenderFragmentSelf(sse *toolbelt.ServerSentEventsHandler, child gomps.NODE, opts ...RenderFragmentOption) error {
	opts = append([]RenderFragmentOption{WithQuerySelectorSelf()}, opts...)
	return RenderFragment(sse, child, opts...)
}

func Redirect(sse *toolbelt.ServerSentEventsHandler, url string) {
	sse.Send(
		fmt.Sprintf("redirect %s", url),
		toolbelt.WithSSEEvent(SSEEventTypeRedirect),
		toolbelt.WithSSERetry(0),
		toolbelt.WithSSESkipMinBytesCheck(true),
	)
}

func RedirectF(sse *toolbelt.ServerSentEventsHandler, urlFormat string, args ...interface{}) {
	Redirect(sse, fmt.Sprintf(urlFormat, args...))
}

func Error(sse *toolbelt.ServerSentEventsHandler, err error) {
	sse.Send(
		fmt.Sprintf("error %s", err.Error()),
		toolbelt.WithSSEEvent(SSEEventTypeError),
		toolbelt.WithSSERetry(0),
		toolbelt.WithSSESkipMinBytesCheck(true),
	)
}

func ErrorF(sse *toolbelt.ServerSentEventsHandler, format string, args ...interface{}) {
	Error(sse, fmt.Errorf(format, args...))
}
