package datastar

import (
	"encoding/json"
	"fmt"
)

func (sse *ServerSentEventGenerator) MarshalAndMergeSignals(store any, opts ...MergeSignalsOption) error {
	b, err := json.Marshal(store)
	if err != nil {
		panic(err)
	}
	if err := sse.MergeSignals(b, opts...); err != nil {
		return fmt.Errorf("failed to merge store: %w", err)
	}

	return nil
}

func (sse *ServerSentEventGenerator) MarshalAndMergeSignalsIfMissing(store any, opts ...MergeSignalsOption) error {
	if err := sse.MarshalAndMergeSignals(
		store,
		append(opts, WithOnlyIfMissing(true))...,
	); err != nil {
		return fmt.Errorf("failed to merge store if missing: %w", err)
	}
	return nil
}

func (sse *ServerSentEventGenerator) MergeSignalsIfMissingRaw(storeJSON string) error {
	if err := sse.MergeSignals([]byte(storeJSON), WithOnlyIfMissing(true)); err != nil {
		return fmt.Errorf("failed to merge store if missing: %w", err)
	}
	return nil
}
