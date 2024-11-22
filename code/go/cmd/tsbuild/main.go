package main

import (
	"log"
	"time"

	"github.com/starfederation/datastar/code/go/tsbuild"
)

func main() {
	start := time.Now()
	log.Print("Datastar built in TS compiler!")
	defer func() {
		log.Printf("Datastar built in %s", time.Since(start))
	}()

	if err := tsbuild.Build(); err != nil {
		log.Fatal(err)
	}

}
