package snake

import (
	"context"
	"fmt"
	"math"
	"sync"
	"time"

	"golang.org/x/exp/rand"
)

type UpdateFunc func(game *SnakeGame) error

type SnakeGame struct {
	mu             sync.RWMutex
	Height, Width  int
	Food           []GameFood
	FoodSize       int
	Snake          []GamePosition // First is the head of the snake
	snakeLength    int
	SnakeDirection Direction
	lastTurn       time.Time // Timestamp of setting snake[1]
	Mode           Mode
	onUpdates      map[int]UpdateFunc
	nextUpdateId   int
}

func (eng *SnakeGame) AddUpdateFunc(onUpdate UpdateFunc) int {
	eng.mu.Lock()
	defer eng.mu.Unlock()
	eng.nextUpdateId++
	if eng.onUpdates == nil {
		eng.onUpdates = map[int]UpdateFunc{}
	}
	eng.onUpdates[eng.nextUpdateId] = onUpdate
	return eng.nextUpdateId
}

func (eng *SnakeGame) RemoveUpdateFunc(id int) {
	eng.mu.Lock()
	defer eng.mu.Unlock()
	delete(eng.onUpdates, id)
}

func (eng *SnakeGame) SetSnakeDirection(direction Direction) {
	// Check, if change is required
	eng.mu.RLock()
	isNewDirection := eng.SnakeDirection != direction
	eng.mu.RUnlock()
	if !isNewDirection {
		return
	}

	eng.mu.Lock()
	eng.SnakeDirection = direction
	eng.Snake = append([]GamePosition{{X: eng.Snake[0].X, Y: eng.Snake[0].Y}}, eng.Snake...)
	eng.lastTurn = time.Now()
	eng.mu.Unlock()
}

func (eng *SnakeGame) GetRandomPosition() GamePosition {
	return GamePosition{
		X: rand.Intn(eng.Width),
		Y: rand.Intn(eng.Height),
	}
}

func (eng *SnakeGame) Restart(width, height, foodCount int) {
	eng.mu.Lock()
	eng.FoodSize = 10
	eng.Mode = ModeNew
	eng.Width = width
	eng.Height = height
	snakePosition := eng.GetRandomPosition()
	eng.Snake = []GamePosition{snakePosition, snakePosition} // Start and end are the same
	eng.SnakeDirection = getRandomDirection()
	eng.snakeLength = 40 // Start length of snake
	eng.Food = make([]GameFood, foodCount)
	for index := range eng.Food {
		eng.Food[index] = GameFood{
			Position: eng.GetRandomPosition(),
		}
	}
	eng.mu.Unlock()
}

// Only works because snake only has vertical and horisontal parts
func snakePartLength(a, b GamePosition) int {
	dx := b.X - a.X
	if dx < 0 {
		dx = -dx
	}
	dy := b.Y - a.Y
	if dy < 0 {
		dy = -dy
	}
	return dx + dy
}

func (eng *SnakeGame) getRealSnakeLength() int {
	realLength := 0
	for index, part := range eng.Snake {
		if index == 0 {
			continue
		}
		realLength += snakePartLength(part, eng.Snake[index-1])
	}
	return realLength
}

const FPS = 60
const targetSleepDuration = time.Second / FPS
const snakeSpeed float64 = 40 / float64(time.Second)

// Run this in a separate thread using "go engine.Run()"
func (eng *SnakeGame) Run(ctx context.Context) error {

	nextUpdateTime := time.Now()

	for {
		// Wait for the game to start
		for eng.Mode != ModeNew {
			time.Sleep(targetSleepDuration)
		}

		// Start the game
		eng.mu.Lock()
		eng.lastTurn = time.Now()
		eng.Mode = ModeRunning
		eng.mu.Unlock()

		// Run the game
		for eng.Mode == ModeRunning {
			now := time.Now()
			if now.Before(nextUpdateTime) {
				time.Sleep(nextUpdateTime.Sub(now))
			}
			nextUpdateTime = nextUpdateTime.Add(targetSleepDuration)

			eng.mu.Lock()

			// Move snake head
			durSinceTurn := time.Since(eng.lastTurn)
			distanceSinceTurnFloat := float64(durSinceTurn) * snakeSpeed
			distanceSinceTurn := int(distanceSinceTurnFloat)
			switch eng.SnakeDirection {
			case DirectionDown:
				eng.Snake[0].Y = eng.Snake[1].Y + distanceSinceTurn
			case DirectionUp:
				eng.Snake[0].Y = eng.Snake[1].Y - distanceSinceTurn
			case DirectionRight:
				eng.Snake[0].X = eng.Snake[1].X + distanceSinceTurn
			case DirectionLeft:
				eng.Snake[0].X = eng.Snake[1].X - distanceSinceTurn
			default:
				panic("Illegal direction")
			}

			// Detect if snake hits itself
			for segindex := range eng.Snake {
				if segindex <= 1 {
					continue
				}
				if checkLinesCrossed(eng.Snake[0], eng.Snake[1], eng.Snake[segindex-1], eng.Snake[segindex]) {
					fmt.Println("Snake crossed itself")
					eng.Mode = ModeFinished
				}

			}

			// Detect if food was hit
			fs := float64(eng.FoodSize)
			for foodindex, food := range eng.Food {
				if food.Position.getDistance(eng.Snake[0]) < fs {
					fmt.Println("Food found!!")
					eng.Food[foodindex].Position = eng.GetRandomPosition()
					eng.snakeLength = eng.snakeLength * 3 / 2
				}
			}

			// Insert extra point in case the snake has no turns, so that lastTurn time has a well defined location
			if len(eng.Snake) == 2 {
				eng.Snake = []GamePosition{eng.Snake[0], eng.Snake[0], eng.Snake[1]}
				eng.lastTurn = now
			}

			// Move snake end
			realLength := eng.getRealSnakeLength()
			extraLength := realLength - eng.snakeLength
			if extraLength > 0 {
				snakeLastIndex := len(eng.Snake) - 1
				snakeLastPartLength := snakePartLength(eng.Snake[snakeLastIndex], eng.Snake[snakeLastIndex-1])
				if snakeLastPartLength <= extraLength {
					eng.Snake = eng.Snake[0:snakeLastIndex]
				} else {
					if eng.Snake[snakeLastIndex].X > eng.Snake[snakeLastIndex-1].X {
						eng.Snake[snakeLastIndex].X -= extraLength
					} else if eng.Snake[snakeLastIndex].X < eng.Snake[snakeLastIndex-1].X {
						eng.Snake[snakeLastIndex].X += extraLength
					} else if eng.Snake[snakeLastIndex].Y > eng.Snake[snakeLastIndex-1].Y {
						eng.Snake[snakeLastIndex].Y -= extraLength
					} else if eng.Snake[snakeLastIndex].Y < eng.Snake[snakeLastIndex-1].Y {
						eng.Snake[snakeLastIndex].Y += extraLength
					} else {
						// Snake's back part has length 0 so we remove it. Next iteration will then cut parts of the next section
						eng.Snake = eng.Snake[0:snakeLastIndex]
					}
				}
			}

			// Check if snake has hit the wall
			if eng.Snake[0].X < 0 || eng.Snake[0].X > eng.Width || eng.Snake[0].Y < 0 || eng.Snake[0].Y > eng.Height {
				fmt.Println("Snake hit the wall")
				eng.Mode = ModeFinished
			}

			eng.mu.Unlock()

			onUpdateCount := len(eng.onUpdates)
			if onUpdateCount > 0 {
				wg := sync.WaitGroup{}
				wg.Add(onUpdateCount)

				errs := make([]error, 0, onUpdateCount)
				for updateID, onUpdate := range eng.onUpdates {
					go func(onUpdate UpdateFunc) {
						defer wg.Done()
						if err := onUpdate(eng); err != nil {
							eng.RemoveUpdateFunc(updateID)
							errs = append(errs, err)
						}
					}(onUpdate)
				}
				wg.Wait()
			}
		}
	}
}

type GamePosition struct {
	X, Y int
}

type GameFood struct {
	Position GamePosition
}

func (a GamePosition) getDistance(b GamePosition) float64 {
	dx := float64(b.X) - float64(a.X)
	dy := float64(b.Y) - float64(a.Y)
	return math.Sqrt(dx*dx + dy*dy)
}

func getRandomDirection() Direction {
	randomint := rand.Intn(4) + 1
	return Direction(randomint)
}

type Mode int

const (
	ModeNotInitialized Mode = iota
	ModeNew
	ModeRunning
	ModeFinished
)

type Direction int

const (
	DirectionUp Direction = 1 + iota
	DirectionRight
	DirectionDown
	DirectionLeft
)

// Assumes that lines are horizontal or vertical
func checkLinesCrossed(linea1, linea2, lineb1, lineb2 GamePosition) bool {
	// Ensure linea1 is the top or left point, and linea2 is the bottom or right point
	if linea1.X > linea2.X || linea1.Y > linea2.Y {
		linea1, linea2 = linea2, linea1
	}

	// Ensure lineb1 is the top or left point, and lineb2 is the bottom or right point
	if lineb1.X > lineb2.X || lineb1.Y > lineb2.Y {
		lineb1, lineb2 = lineb2, lineb1
	}

	// Check if lines are vertical and horizontal
	isLineaVertical := linea1.X == linea2.X
	isLineaHorizontal := linea1.Y == linea2.Y
	isLinebVertical := lineb1.X == lineb2.X
	isLinebHorizontal := lineb1.Y == lineb2.Y

	if isLineaVertical && isLineaHorizontal {
		return false
	}

	if isLinebVertical && isLinebHorizontal {
		return false
	}

	// If one line is vertical and the other is horizontal, check for intersection
	if isLineaVertical && isLinebHorizontal {
		// Linea is vertical and Lineb is horizontal
		crossed := lineb1.X < linea1.X && lineb2.X > linea1.X &&
			linea1.Y < lineb1.Y && linea2.Y > lineb1.Y
		if crossed {
			fmt.Println("Crossed: ", linea1, linea2, lineb1, lineb2)
		}
		return crossed
	} else if isLineaHorizontal && isLinebVertical {
		// Linea is horizontal and Lineb is vertical
		crossed := linea1.X < lineb1.X && linea2.X > lineb1.X &&
			lineb1.Y < linea1.Y && lineb2.Y > linea1.Y
		if crossed {
			fmt.Println("Crossed: ", linea1, linea2, lineb1, lineb2)
		}
		return crossed
	}

	// If both lines are either vertical or horizontal, they can't cross
	return false
}
