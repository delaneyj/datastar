package smoketests

import (
	"context"
	"fmt"
	"sync"
	"testing"
	"time"

	"github.com/delaneyj/toolbelt"
	"github.com/go-rod/rod"
	"github.com/starfederation/datastar/site"
	"github.com/stretchr/testify/require"
)

var (
	baseURL string
	ctx     context.Context
	cancel  context.CancelFunc
)

type UnitTest struct {
	t       *testing.T
	ctx     context.Context
	browser *rod.Browser
}

func TestMain(m *testing.M) {
	ctx, cancel = context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	port, err := toolbelt.FreePort()
	if err != nil {
		panic(err)
	}

	baseURL = fmt.Sprintf("http://localhost:%d", port)

	readyCh := make(chan struct{})
	go site.RunBlocking(port, readyCh)(ctx)
	<-readyCh

	m.Run()

}

var setup = func() func(t *testing.T) UnitTest {
	browser := rod.New().MustConnect()
	return func(t *testing.T) UnitTest {
		// t.Parallel()
		return UnitTest{t, ctx, browser}
	}
}()

func (u UnitTest) page(url string) *rod.Page {
	page := u.browser.MustIncognito().MustPage(fmt.Sprintf("%s/%s", baseURL, url))
	u.t.Cleanup(page.MustClose)
	return page
}

type runnerFn func(name string, fn func(t *testing.T, page *rod.Page))

func setupPageTest(t *testing.T, subURL string, gen func(runner runnerFn)) {
	t.Parallel()
	browser := rod.New().MustConnect()
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Minute)
	defer cancel()

	page := browser.MustIncognito().MustPage(fmt.Sprintf("%s/%s", baseURL, subURL))
	require.NotNil(t, page)
	t.Cleanup(page.MustClose)

	port, err := toolbelt.FreePort()
	require.NoError(t, err)

	baseURL = fmt.Sprintf("http://localhost:%d", port)

	readyCh := make(chan struct{})
	go site.RunBlocking(port, readyCh)(ctx)
	<-readyCh

	wg := &sync.WaitGroup{}

	runner := func(name string, fn func(t *testing.T, page *rod.Page)) {
		wg.Add(1)
		defer wg.Done()
		fn(t, page)
	}

	gen(runner)

	wg.Wait()
}
