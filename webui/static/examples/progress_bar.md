## Progress Bar

[Original HTMX Version](https://htmx.org/examples/progress-bar/)

## Demo
<div
    id="progress_bar"
    data-fetch-url="'/examples/progress_bar/data'"
    data-on-load="$$get"
>
     Replace me
</div>

## Explanation
This example shows how to implement a smoothly scrolling progress bar.

We start with an initial state with a button that issues a POST to /start to begin the job:
```html
<div hx-target="this" hx-swap="outerHTML">
  <h3>Start Progress</h3>
  <button class="btn" hx-post="/start">
            Start Job
  </button>
</div>
```
This div is then replaced with a new div containing status and a progress bar that reloads itself every 600ms:
```html
<div hx-trigger="done" hx-get="/job" hx-swap="outerHTML" hx-target="this">
  <h3 role="status" id="pblabel" tabindex="-1" autofocus>Running</h3>

  <div
    hx-get="/job/progress"
    hx-trigger="every 600ms"
    hx-target="this"
    hx-swap="innerHTML">
    <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-labelledby="pblabel">
      <div id="pb" class="progress-bar" style="width:0%">
    </div>
  </div>
</div>
```

This progress bar is updated every 600 milliseconds, with the “width” style attribute and aria-valuenow attributed set to current progress value. Because there is an id on the progress bar div, htmx will smoothly transition between requests by settling the style attribute into its new value. This, when coupled with CSS transitions, makes the visual transition continuous rather than jumpy.

Finally, when the process is complete, a server returns HX-Trigger: done header, which triggers an update of the UI to “Complete” state with a restart button added to the UI (we are using the class-tools extension in this example to add fade-in effect on the button):
```html
<div hx-trigger="done" hx-get="/job" hx-swap="outerHTML" hx-target="this">
  <h3 role="status" id="pblabel" tabindex="-1" autofocus>Complete</h3>

  <div
    hx-get="/job/progress"
    hx-trigger="none"
    hx-target="this"
    hx-swap="innerHTML">
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="122" aria-labelledby="pblabel">
        <div id="pb" class="progress-bar" style="width:122%">
      </div>
    </div>
  </div>

  <button id="restart-btn" class="btn" hx-post="/start" classes="add show:600ms">
    Restart Job
  </button>
</div>
```html