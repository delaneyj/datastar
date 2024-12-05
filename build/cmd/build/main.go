package main

import (
	"log"
	"time"

	build "github.com/starfederation/datastar/build"
)

func main() {
	start := time.Now()
	log.Print("Datastar built in TS compiler!")
	defer func() {
		log.Printf("Datastar built in %s", time.Since(start))
	}()

	if err := build.Build(); err != nil {
		log.Fatal(err)
	}

}
