package main

import (
	"context"
	"encoding/gob"
	"fmt"
	"log"
	"os"

	"github.com/klauspost/compress/zstd"
	"github.com/starfederation/datastar/code/go/site"
	"github.com/valyala/bytebufferpool"
)

const framesDir = "../../../../../bad-apple-ascii/frames-ascii/"
const outputDir = "../../site/static/images/"

func main() {
	ctx := context.Background()
	if err := run(ctx); err != nil {
		log.Fatal(err)
	}
}

func run(ctx context.Context) error {
	_ = ctx

	entries, err := os.ReadDir(framesDir)
	if err != nil {
		return fmt.Errorf("failed to read directory %s: %w", framesDir, err)
	}

	anim := &site.AsciiAnimation{
		Frames: make([]string, len(entries)),
	}

	for i, entry := range entries {
		fullpath := framesDir + entry.Name()
		b, err := os.ReadFile(fullpath)
		if err != nil {
			return fmt.Errorf("failed to read file %s: %w", fullpath, err)
		}
		anim.Frames[i] = string(b)
	}

	gob.Register(anim)
	buf := bytebufferpool.Get()
	defer bytebufferpool.Put(buf)
	enc := gob.NewEncoder(buf)
	if err := enc.Encode(anim); err != nil {
		return fmt.Errorf("failed to encode animation: %w", err)
	}

	// add zstd compression
	encoder, err := zstd.NewWriter(nil)
	if err != nil {
		return fmt.Errorf("failed to create zstd encoder: %w", err)
	}

	compressed := encoder.EncodeAll(buf.Bytes(), nil)
	fullpath := outputDir + "badapple.zst"
	if err := os.WriteFile(fullpath, compressed, 0644); err != nil {
		return fmt.Errorf("failed to write compressed file: %w", err)
	}

	return nil
}
