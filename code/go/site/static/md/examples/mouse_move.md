## Mouse Move

## Demo

<div data-store="{id:'unknown',x:0,y:0}" data-on-load="@get('/examples/mouse_move/updates')">
    <div>
        X: <span data-text="$x"></span>
        Y: <span data-text="$y"></span>
    </div>
    <div id="container"></div>
</div>

## Explanation

```html
<div
    data-store="{id:'unknown',x:0,y:0}"
    data-on-load="@get('/examples/mouse_move/updates')">
    <div>
        X: <span data-text="$x"></span>
        Y: <span data-text="$y"></span>
    </div>
    <div id="container"></div>
</div>
```

Here we are doing similar watcher action to the front page TodoMVC. We are loading the example from the server to avoid some markdown parsing issues.

Here are the templates that are rendered.

```templ
package site

import (
	"fmt"
)

templ MouseMouseUI(id string, collection *MouseXYCollection)  {
	<div
	id="container"
			data-on-store-change.throttle_10ms="@put('/examples/mouse_move/updates')"
			data-store={fmt.Sprintf("{id:'%s',x:0,y:0}", id)}
	>
		<div>My ID: {id}</div>
	@cursorSVG( collection.Positions)
	</div>
}

templ cursorSVG( cursors map[string]MouseXY){
	<svg
		id="cursorSVG"
		width="512"
		height="512"
		style="background-color: goldenrod"
		data-on-mousemove="$x=evt.offsetX; $y=evt.offsetY"
	>
		for id, cursor := range cursors {
			{{
				x := fmt.Sprintf("%d", cursor.X)
				y := fmt.Sprintf("%d", cursor.Y)
			}}
			<circle cx={x} cy={y} r="10" fill="blue"></circle>
			<text
				x={x}
				y={y}
				fill="black"
				class="text-xs"
				dominant-baseline="top"
				text-anchor="middle"
			>
				{id}
			</text>
		}
		<g id="myPosition">
			<circle data-bind-cx="$x" data-bind-cy="$y" r="10" fill="red"></circle>
		</g>
	</svg>
}
```

On page load we create the whole page and when there are updates the `cursorSVG` is run.  This is writing to a KV store, so every update is getting marshalled to JSON for all cursors and then unmarshalled per viewer.  Also, this is only happening when a user moves the mouse.  In a real game/app you would send a steady stream of data but this is showing you can key of different events depending on your situation of SLA.
