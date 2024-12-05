package smoketests

import (
	"context"
	"fmt"
	"testing"

	"github.com/delaneyj/toolbelt"
	"github.com/go-rod/rod"
	"github.com/starfederation/datastar/site"
	"github.com/ysmood/got"
)

var (
	baseURL string
)

// test context
type G struct {
	got.G
	browser *rod.Browser
}

func TestMain(m *testing.M) {
	ctx := context.Background()

	port, err := toolbelt.FreePort()
	if err != nil {
		panic(err)
	}

	baseURL = fmt.Sprintf("http://localhost:%d", port)

	readyCh := make(chan struct{})
	go site.RunBlocking(port, readyCh)(ctx)
	<-readyCh

	m.Run()

	ctx.Done()
}

var setup = func() func(t *testing.T) G {

	browser := rod.New().MustConnect()

	return func(t *testing.T) G {
		t.Parallel() // run each test concurrently
		return G{got.New(t), browser}
	}
}()

func (g G) page(url string) *rod.Page {
	page := g.browser.MustIncognito().MustPage(fmt.Sprintf("%s/%s", baseURL, url))
	g.Cleanup(page.MustClose)
	return page
}
