package smoketests

import (
	"context"
	"fmt"
	"log"
	"path/filepath"
	"testing"

	"github.com/delaneyj/toolbelt"
	"github.com/go-rod/rod"
	"github.com/starfederation/datastar/code/go/site"
	"github.com/stretchr/testify/require"
)

func pageFromURL(ctx context.Context, url string) (*rod.Page, error) {
	port, err := toolbelt.FreePort()
	if err != nil {
		return nil, fmt.Errorf("could not get free port: %w", err)
	}
	fullURL := fmt.Sprintf("http://localhost:%d/%s", port, url)
	log.Printf("running site for %s", fullURL)
	defer log.Printf("closing site for %s", fullURL)

	readyCh := make(chan struct{})
	go site.RunBlocking(port, readyCh)(ctx)
	<-readyCh

	p := rod.New().MustConnect().MustPage(fullURL).Context(ctx)

	return p, nil
}

func testExamplesPage(t *testing.T, url string) (page *rod.Page) {
	t.Parallel()

	fullURL := filepath.Join("examples", url)
	page, err := pageFromURL(context.Background(), fullURL)
	require.NoError(t, err)

	return page
}
