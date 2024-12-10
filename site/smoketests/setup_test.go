package smoketests

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/delaneyj/toolbelt"
	"github.com/go-rod/rod"
	"github.com/starfederation/datastar/site"
)

var (
	baseURL string
)

type UnitTest struct {
	t       *testing.T
	ctx     context.Context
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

var setup = func() func(t *testing.T) UnitTest {
	browser := rod.New().MustConnect()
	return func(t *testing.T) UnitTest {
		t.Parallel()
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		return UnitTest{t, ctx, browser}
	}
}()

func (u UnitTest) page(url string) *rod.Page {
	page := u.browser.MustIncognito().MustPage(fmt.Sprintf("%s/%s", baseURL, url))
	u.t.Cleanup(page.MustClose)
	return page
}
