import asyncio
from datetime import datetime

from sanic import Sanic
from sanic.response import html

from datastar_py import ServerSentEventGenerator
from datastar_py.responses import make_datastar_sanic_response

app = Sanic("DataStarApp")

HTML = """\
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<title>DATASTAR on Sanic</title>
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar/bundles/datastar.js"></script>
			<style>
            html, body { height: 100%; width: 100%; }
            body { background-image: linear-gradient(to right bottom, oklch(0.424958 0.052808 253.972015), oklch(0.189627 0.038744 264.832977)); }
            .container { display: grid; place-content: center; }
            .time { padding: 2rem; border-radius: 8px; margin-top: 3rem; font-family: monospace, sans-serif; background-color: oklch(0.916374 0.034554 90.5157); color: oklch(0.265104 0.006243 0.522862 / 0.6); font-weight: 600; }
			</style>
		</head>
		<body
            data-store="{currentTime: 'CURRENT_TIME'}"
			data-on-pageshow.window="evt?.persisted && window.location.reload()"
		>
        <div class="container">
            <div
            class="time"
            data-on-load="$get('/updates')"
            >
            Current time from fragment: <span id="currentTime">CURRENT_TIME</span>
            </div>
            <div
            class="time"
            >
            Current time from signal: <span data-text="$currentTime">CURRENT_TIME</span>
            </div>
        </div>
		</body>
	</html>
"""


@app.get("/")
async def hello_world(request):
    return html(HTML.replace("CURRENT_TIME", f"{datetime.isoformat(datetime.now())}"))


@app.get("/updates")
async def updates(request):
    response = await make_datastar_sanic_response(request)

    sse = ServerSentEventGenerator()
    while True:
        await response.send(
            sse.merge_fragments(
                [f"""<span id="currentTime">{datetime.now().isoformat()}"""]
            )
        )
        await asyncio.sleep(10)
        await response.send(
            sse.merge_signals({"currentTime": f"{datetime.now().isoformat()}"})
        )
        await asyncio.sleep(10)
