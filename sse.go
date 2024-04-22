package datastar

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

type ServerSentEventsHandler struct {
	w               http.ResponseWriter
	flusher         http.Flusher
	shouldLogPanics bool
	hasPanicked     bool
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
		w:               w,
		flusher:         flusher,
		shouldLogPanics: true,
		nextID:          0,
	}
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

func (sse *ServerSentEventsHandler) Send(data string, opts ...SSEEventOption) {
	sse.SendMultiData([]string{data}, opts...)
}

func (sse *ServerSentEventsHandler) SendMultiData(dataArr []string, opts ...SSEEventOption) {
	if sse.hasPanicked && len(dataArr) > 0 {
		return
	}
	defer func() {
		// Can happen if the client closes the connection or
		// other middleware panics during flush (such as compression)
		// Not ideal, but we can't do much about it
		if r := recover(); r != nil && sse.shouldLogPanics {
			sse.hasPanicked = true
			log.Printf("recovered from panic: %v", r)
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
			panic(fmt.Sprintf("failed to write event: %v", err))
		}
		totalSize += eventSize
	}
	if evt.Id != "" {
		idFmt := fmt.Sprintf("id: %s\n", evt.Id)
		idSize, err := sse.w.Write([]byte(idFmt))
		if err != nil {
			panic(fmt.Sprintf("failed to write id: %v", err))
		}
		totalSize += idSize
	}
	if evt.Retry.Milliseconds() > 0 {
		retryFmt := fmt.Sprintf("retry: %d\n", evt.Retry.Milliseconds())
		retrySize, err := sse.w.Write([]byte(retryFmt))
		if err != nil {
			panic(fmt.Sprintf("failed to write retry: %v", err))
		}
		totalSize += retrySize
	}

	newLineBuf := []byte("\n")
	for _, d := range evt.Data {
		dataFmt := fmt.Sprintf("data: %s", d)
		dataSize, err := sse.w.Write([]byte(dataFmt))
		if err != nil {
			panic(fmt.Sprintf("failed to write data: %v", err))
		}
		totalSize += dataSize
		sse.w.Write(newLineBuf)
	}
	sse.w.Write([]byte("\n\n"))
	sse.flusher.Flush()

	// log.Printf("flushed %d bytes", totalSize)
}
