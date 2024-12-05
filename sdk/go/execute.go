package datastar

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

type ExecuteScriptOptions struct {
	EventID       string
	RetryDuration time.Duration
	Attributes    []string
	AutoRemove    *bool
}

type ExecuteScriptOption func(*ExecuteScriptOptions)

func WithExecuteScriptEventID(id string) ExecuteScriptOption {
	return func(o *ExecuteScriptOptions) {
		o.EventID = id
	}
}

func WithExecuteScriptRetryDuration(retryDuration time.Duration) ExecuteScriptOption {
	return func(o *ExecuteScriptOptions) {
		o.RetryDuration = retryDuration
	}
}

func WithExecuteScriptAttributes(attributes ...string) ExecuteScriptOption {
	return func(o *ExecuteScriptOptions) {
		o.Attributes = attributes
	}
}

func WithExecuteScriptAttributeKVs(kvs ...string) ExecuteScriptOption {
	if len(kvs)%2 != 0 {
		panic("WithExecuteScriptAttributeKVs requires an even number of arguments")
	}
	attributes := make([]string, 0, len(kvs)/2)
	for i := 0; i < len(kvs); i += 2 {
		attribute := fmt.Sprintf("%s %s", kvs[i], kvs[i+1])
		attributes = append(attributes, attribute)
	}
	return WithExecuteScriptAttributes(attributes...)
}

func WithExecuteScriptAutoRemove(autoremove bool) ExecuteScriptOption {
	return func(o *ExecuteScriptOptions) {
		o.AutoRemove = &autoremove
	}
}

func (sse *ServerSentEventGenerator) ExecuteScript(scriptContents string, opts ...ExecuteScriptOption) error {
	options := &ExecuteScriptOptions{
		RetryDuration: DefaultSseRetryDuration,
		Attributes:    []string{"type module"},
	}
	for _, opt := range opts {
		opt(options)
	}

	sendOpts := make([]SSEEventOption, 0, 2)
	if options.EventID != "" {
		sendOpts = append(sendOpts, WithSSEEventId(options.EventID))
	}

	if options.RetryDuration != DefaultSseRetryDuration {
		sendOpts = append(sendOpts, WithSSERetryDuration(options.RetryDuration))
	}

	dataLines := make([]string, 0, 64)
	if options.AutoRemove != nil && *options.AutoRemove != DefaultExecuteScriptAutoRemove {
		dataLines = append(dataLines, AutoRemoveDatalineLiteral+strconv.FormatBool(*options.AutoRemove))
	}
	dataLinesJoined := strings.Join(dataLines, NewLine)

	if dataLinesJoined != DefaultExecuteScriptAttributes {
		for _, attribute := range options.Attributes {
			dataLines = append(dataLines, AttributesDatalineLiteral+attribute)
		}
	}

	scriptLines := strings.Split(scriptContents, NewLine)
	for _, line := range scriptLines {
		dataLines = append(dataLines, ScriptDatalineLiteral+line)
	}

	return sse.Send(
		EventTypeExecuteScript,
		dataLines,
		sendOpts...,
	)
}
