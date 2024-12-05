package datastar

import (
	"encoding/json"
	"fmt"
)

func (sse *ServerSentEventGenerator) MarshalAndMergeSignals(signals any, opts ...MergeSignalsOption) error {
	b, err := json.Marshal(signals)
	if err != nil {
		panic(err)
	}
	if err := sse.MergeSignals(b, opts...); err != nil {
		return fmt.Errorf("failed to merge signals: %w", err)
	}

	return nil
}

func (sse *ServerSentEventGenerator) MarshalAndMergeSignalsIfMissing(signals any, opts ...MergeSignalsOption) error {
	if err := sse.MarshalAndMergeSignals(
		signals,
		append(opts, WithOnlyIfMissing(true))...,
	); err != nil {
		return fmt.Errorf("failed to merge signals if missing: %w", err)
	}
	return nil
}

func (sse *ServerSentEventGenerator) MergeSignalsIfMissingRaw(signalsJSON string) error {
	if err := sse.MergeSignals([]byte(signalsJSON), WithOnlyIfMissing(true)); err != nil {
		return fmt.Errorf("failed to merge signals if missing: %w", err)
	}
	return nil
}
