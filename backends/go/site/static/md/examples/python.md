## Explanation

An example backend in Python.

```python
import os, json, time, secrets, uvicorn
from starlette.applications import Starlette
from starlette.responses import HTMLResponse, StreamingResponse

app = Starlette()
target = 'target'

def send_index():
    store = {'input': '', 'output': '', 'show': True}
    index_page = f'''
    <!doctype html><html>
    <head>
      <title>Node/Express + Datastar Example</title>
      <script type="module" defer src="https://cdn.jsdelivr.net/npm/@sudodevnull/datastar"></script></head>
    <body>
      <h2>Node/Express + Datastar Example</h2>
      <main class="container" id="main" data-store=\'{json.dumps(store)}\'>
        <input type="text" placeholder="Send to server..." data-model="input"/>
        <button data-on-click="$$get('/get')">Send State Roundtrip</button>
        <button data-on-click="$$get('/target')">Target HTML Element</button>
        <button data-on-click="$show=!$show">Toggle Feed</button>
        <div id="output" data-text="$output"></div>
        <div id="{target}"></div>
        <div data-show="$show">
          <span>Feed from server: </span>
          <span id="feed" data-on-load="$$get('/feed')"></span>
        </div></main></body></html>
'''
    return HTMLResponse(index_page)

def send_event(frag, merge=False):
    yield 'event: datastar-fragment\n'
    if merge:
        yield 'data: merge upsert_attributes\n'
    yield f'data: fragment {frag}\n\n'

def send_stream():
    while True:
        rand = secrets.token_hex(8)
        frag = f'<span id="feed">{rand}</span>'
        yield from send_event(frag)
        time.sleep(1)

@app.route('/')
async def homepage(request):
    return send_index()

@app.route('/get')
async def get_data(request):
    store = json.loads(dict(request.query_params)['datastar'])
    store['output'] = f"Your input: {store['input']}, is {len(store['input'])} long."
    frag = f'<main id="main" data-store=\'{json.dumps(store)}\'></main>'
    return StreamingResponse(send_event(frag, True))

@app.route('/target')
async def target_element(request):
    today = time.strftime("%Y-%m-%d %H:%M:%S")
    frag = f'<div id="{target}"><b>{today}</b></div>'
    return StreamingResponse(send_event(frag))

@app.route('/feed')
async def feed(request):
    return StreamingResponse(send_stream())

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=int(os.environ.get('PORT', 3000)))
```

```html
<div class="container">
  <img src="foo.img" />
</div>
```
