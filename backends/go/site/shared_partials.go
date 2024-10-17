package site

import (
	"bytes"
	"compress/gzip"
	"fmt"
	"strings"

	"github.com/a-h/templ"
	"github.com/dustin/go-humanize"
	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/parser"
)

var (
	iifeBuildSize    int
	iifeBuildSizeStr string
)

func upsertIIfeBuildSize() string {
	if iifeBuildSizeStr != "" {
		return iifeBuildSizeStr
	}
	build, err := staticFS.ReadFile("static/library/datastar.iife.js")
	if err != nil {
		panic(err)
	}
	buf := bytes.NewBuffer(nil)
	w, err := gzip.NewWriterLevel(buf, gzip.BestCompression)
	if err != nil {
		panic(err)
	}

	if _, err := w.Write(build); err != nil {
		panic(err)
	}
	w.Close()
	iifeBuildSize = buf.Len()
	iifeBuildSizeStr = humanize.IBytes(uint64(iifeBuildSize))
	return iifeBuildSizeStr
}

func markdownRenders(staticMdPath string) (mdElementRenderers map[string]string, mdAnchors map[string][]string, err error) {
	mdDir := "static/md/" + staticMdPath
	docs, err := staticFS.ReadDir(mdDir)
	if err != nil {
		return nil, nil, fmt.Errorf("error reading docs dir: %w", err)
	}

	// regExpImg := regexp.MustCompile(`(?P<whole>!\[[^\]]+]\((?P<path>[^)]+)\))`)
	// prefix := []byte("/static/")

	mdElementRenderers = map[string]string{}
	mdAnchors = map[string][]string{}
	for _, de := range docs {
		fullPath := mdDir + "/" + de.Name()

		b, err := staticFS.ReadFile(fullPath)
		if err != nil {
			return nil, nil, fmt.Errorf("error reading doc %s: %w", de.Name(), err)
		}

		// Package version
		b = bytes.ReplaceAll(b, []byte("PACKAGE_VERSION"), []byte(packageJSON.Version))

		// Get all anchors
		anchors := []string{}
		lines := strings.Split(string(b), "\n")
		for _, line := range lines {
			if strings.HasPrefix(line, "#") {
				parts := strings.Split(line, " ")
				anchor := strings.Join(parts[1:], " ")
				anchors = append(anchors, anchor)
			}
		}

		mdParser := parser.NewWithExtensions(parser.CommonExtensions | parser.AutoHeadingIDs | parser.NoEmptyLineBeforeBlock | parser.Footnotes)
		doc := mdParser.Parse(b)
		renderedHTML := string(markdown.Render(doc, mdRenderer()))

		name := de.Name()[0 : len(de.Name())-3]
		mdElementRenderers[name] = renderedHTML
		mdAnchors[name] = anchors
	}

	return mdElementRenderers, mdAnchors, nil
}

func KVPairsAttrs(kvPairs ...string) templ.Attributes {
	if len(kvPairs)%2 != 0 {
		panic("kvPairs must be a multiple of 2")
	}
	attrs := templ.Attributes{}
	for i := 0; i < len(kvPairs); i += 2 {
		attrs[kvPairs[i]] = kvPairs[i+1]
	}
	return attrs
}
