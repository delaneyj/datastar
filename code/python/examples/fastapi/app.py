import asyncio
from datetime import datetime

from fastapi import FastAPI
from fastapi.responses import HTMLResponse, StreamingResponse

from datastar_py import SSE_HEADERS, ServerSentEventGenerator

app = FastAPI()


HTML = """\
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<title>DATASTAR</title>
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			<!-- <link rel="icon" href={ staticPath("images/datastar_icon.svg") }/> -->
			<!-- <link href={ staticPath("css/site.css") } rel="stylesheet" type="text/css"/> -->
			<link rel="preconnect" href="https://fonts.googleapis.com"/>
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
			<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Orbitron:wght@400..900&display=swap" rel="stylesheet"/>
			<script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"></script>
            <script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar/bundles/datastar.js"></script>
            <link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
>
			<style>
            body, div {
            margin-top: 2rem;
            }
			</style>
		</head>
		<body
            data-store="{currentTime: 'CURRENT_TIME'}"
			data-on-pageshow.window="evt?.persisted && window.location.reload()"
			class="container flex flex-col min-h-screen overflow-y-scroll min-w-screen scrollbar scrollbar-thumb-primary scrollbar-track-accent"
		>
        <div data-on-load="$get('/updates')">Current time from fragment: <span id="currentTime">CURRENT_TIME</span></div>
        <div>Current time from signal: <span data-text="$currentTime">CURRENT_TIME</span></div>
		</body>
	</html>
    """


@app.get("/")
async def read_root():
    return HTMLResponse(
        HTML.replace("CURRENT_TIME", f"{datetime.isoformat(datetime.now())}")
    )


async def time_updates():
    sse = ServerSentEventGenerator()
    while True:
        yield sse.merge_fragments(
            [f"""<span id="currentTime">{datetime.now().isoformat()}"""]
        )
        await asyncio.sleep(1)
        yield sse.merge_signals({"currentTime": f"{datetime.now().isoformat()}"})
        await asyncio.sleep(1)


@app.get("/updates")
async def updates():
    return StreamingResponse(time_updates(), headers=SSE_HEADERS)
