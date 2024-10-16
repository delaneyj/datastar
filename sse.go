package datastar

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type ServerSentEventsHandler struct {
	ctx             context.Context
	mu              *sync.Mutex
	w               http.ResponseWriter
	flusher         http.Flusher
	shouldLogPanics bool
	hasErrored      bool
	nextID          int
}

func NewSSE(w http.ResponseWriter, r *http.Request) *ServerSentEventsHandler {
	flusher, ok := w.(http.Flusher)
	if !ok {
		panic("response writer does not support flushing")
	}
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Content-Type", "text/event-stream")
	flusher.Flush()

	return &ServerSentEventsHandler{
		ctx:             r.Context(),
		mu:              &sync.Mutex{},
		w:               w,
		flusher:         flusher,
		shouldLogPanics: true,
		nextID:          0,
	}
}

func (sse *ServerSentEventsHandler) Context() context.Context {
	return sse.ctx
}

type SSEEvent struct {
	Id    string
	Event string
	Data  []string
	Retry time.Duration
}

type SSEEventOption func(*SSEEvent)

func WithSSEId(id string) SSEEventOption {
	return func(e *SSEEvent) {
		e.Id = id
	}
}

func WithSSEEvent(event string) SSEEventOption {
	return func(e *SSEEvent) {
		e.Event = event
	}
}

func WithSSERetry(retry time.Duration) SSEEventOption {
	return func(e *SSEEvent) {
		e.Retry = retry
	}
}

func (sse *ServerSentEventsHandler) Send(data string, opts ...SSEEventOption) error {
	return sse.sendMultiData([]string{data}, opts...)
}

func (sse *ServerSentEventsHandler) SendMultiData(dataArr []string, opts ...SSEEventOption) error {
	return sse.sendMultiData(dataArr, opts...)
}

func (sse *ServerSentEventsHandler) sendMultiData(dataArr []string, opts ...SSEEventOption) error {
	sse.mu.Lock()
	defer sse.mu.Unlock()
	if sse.hasErrored || len(dataArr) == 0 {
		return fmt.Errorf("cannot send data after error")
	}
	err := sse._sendMultiData(dataArr, opts...)
	if err != nil {
		sse.hasErrored = true
		return err
	}
	return nil
}

func (sse *ServerSentEventsHandler) _sendMultiData(dataArr []string, opts ...SSEEventOption) (err error) {
	defer func() {
		// Can happen if the client closes the connection or
		// other middleware panics during flush (such as compression)
		// Not ideal, but we can't do much about it
		if r := recover(); r != nil && sse.shouldLogPanics {
			err = fmt.Errorf("recovered from panic: %v", r)
		}
	}()

	evt := SSEEvent{
		Id:    fmt.Sprintf("%d", sse.nextID),
		Event: "",
		Data:  dataArr,
		Retry: time.Second,
	}
	sse.nextID++
	for _, opt := range opts {
		opt(&evt)
	}

	totalSize := 0

	if evt.Event != "" {
		evtFmt := fmt.Sprintf("event: %s\n", evt.Event)
		eventSize, err := sse.w.Write([]byte(evtFmt))
		if err != nil {
			return fmt.Errorf("failed to write event: %w", err)
		}
		totalSize += eventSize
	}
	if evt.Id != "" {
		idFmt := fmt.Sprintf("id: %s\n", evt.Id)
		idSize, err := sse.w.Write([]byte(idFmt))
		if err != nil {
			return fmt.Errorf("failed to write id: %w", err)
		}
		totalSize += idSize
	}
	if evt.Retry.Milliseconds() > 0 {
		retryFmt := fmt.Sprintf("retry: %d\n", evt.Retry.Milliseconds())
		retrySize, err := sse.w.Write([]byte(retryFmt))
		if err != nil {
			return fmt.Errorf("failed to write retry: %w", err)
		}
		totalSize += retrySize
	}

	newLineBuf := []byte("\n")
	for _, d := range evt.Data {
		dataFmt := fmt.Sprintf("data: %s", d)
		dataSize, err := sse.w.Write([]byte(dataFmt))
		if err != nil {
			return fmt.Errorf("failed to write data: %v", err)
		}
		totalSize += dataSize
		sse.w.Write(newLineBuf)
	}
	_, err = sse.w.Write([]byte("\n\n"))
	if err != nil {
		return fmt.Errorf("failed to write final newline: %w", err)
	}
	sse.flusher.Flush()
	return nil
	// log.Printf("flushed %d bytes", totalSize)
}
