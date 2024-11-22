## Snake Game

## Demo

<div
			id="snake_example"
			class="flex flex-col gap-4"
			data-on-load="$get('/examples/snake/updates')"
		>
			<div id="snake_buttons"></div>
      <div id="snake_arena"></div>
      <div class="alert alert-info">
        <iconify-icon icon="mdi:snake"></iconify-icon>
				Can use buttons or WASD keys to control the snake
			</div>
  </div>

## Explanation

This is a port of a HTMX snake game [that showed up on Reddit](https://www.reddit.com/r/htmx/comments/1eqenc8/snake_game_demo_implemented_with_htmx_no_extra/). Since the original was in Go and I tried to keep the code as close to the original as possible.

It is a live global game. Any player on this page will be able to control the snake. The snake will move in the direction of the last key pressed. Play with your friends!

In the original they were talking about

> It has a framerate of more than 10 on my computer

I've run this version at 500+ fps but browsers can't keep up with updates that fast. I've set it to 60fps for now.
