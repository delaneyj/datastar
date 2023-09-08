package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/signal"

	"github.com/delaneyj/datastar/docs"
	"github.com/delaneyj/toolbelt"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	logger.Info("Starting Docs Server")
	defer logger.Info("Stopping Docs Server")

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	if err := run(ctx); err != nil {
		logger.Error("Error running docs server", slog.Any("err", err))
		os.Exit(1)
	}

}

func run(ctx context.Context) error {
	eg := toolbelt.NewErrGroupSharedCtx(ctx, docs.RunBlocking)
	if err := eg.Wait(); err != nil {
		return fmt.Errorf("error running docs server: %w", err)
	}

	return nil
}
