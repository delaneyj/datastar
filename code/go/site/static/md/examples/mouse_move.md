## Mouse Move

## Demo

<div data-signals="{id:'unknown',x:0,y:0}" data-on-load="sse('/examples/mouse_move/updates')">
    <div>
        X: <span data-text="x.value"></span>
        Y: <span data-text="y.value"></span>
    </div>
    <div id="container"></div>
</div>

## Explanation

```html
<div
    data-signals="{id:'unknown',x:0,y:0}"
    data-on-load="sse('/examples/mouse_move/updates')">
    <div>
        X: <span data-text="x.value"></span>
        Y: <span data-text="y.value"></span>
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
	datastar "github.com/starfederation/datastar/go/sdk"
)

templ MouseMouseUI(id string, collection *MouseXYCollection)  {
	<div
	id="container"
			data-on-signals-change.throttle_10ms={datastar.PutSSE("/examples/mouse_move/updates")}
			data-signals={fmt.Sprintf("{id:'%s',x:0,y:0}", id)}
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
		data-on-mousemove="x.value=evt.offsetX; y.value=evt.offsetY"
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
			<circle data-attributes="{cx:x.value,cy:y.value}" r="10" fill="red"></circle>
		</g>
	</svg>
}
```

On page load we create the whole page and when there are updates the `cursorSVG` is run.  This is writing to a KV signals, so every update is getting marshalled to JSON for all cursors and then unmarshalled per viewer.  Also, this is only happening when a user moves the mouse.  In a real game/app you would send a steady stream of data but this is showing you can key of different events depending on your situation of SLA.
