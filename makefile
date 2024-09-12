runtest:
	 templ generate -path test/go/view && go run ./test/go/main.go

buildlib:
	pnpm --dir ./packages/library run build