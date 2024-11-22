## Progress Bar

[Original HTMX Version](https://htmx.org/examples/progress-bar/)

## Demo

<div
    id="progress_bar"
    data-on-load="$get('/examples/progress_bar/data')"
>
</div>

## Explanation

This example shows how to implement an updating progress graphic. Since Datastar is using SSE this is very easy to implement. The server sends a progress value every 500 milliseconds, and the client updates the progress bar accordingly sending down a new SVG. After the progress is complete, the server a button to restart the job.
