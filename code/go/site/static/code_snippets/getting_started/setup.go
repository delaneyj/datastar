import (datastar "github.com/starfederation/datastar/code/go/sdk")

// Creates a new `ServerSentEventGenerator` instance.
sse := datastar.NewSSE(w,r)

// Merges HTML fragments into the DOM.
sse.MergeFragments(
    `<div id="question">What do you put in a toaster?</div>`
)

// Merges signals into the store.
sse.MergeSignals(`{response: '', answer: 'bread'}`)
