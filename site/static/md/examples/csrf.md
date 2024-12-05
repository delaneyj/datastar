## CSRF

## Explanation

Sometimes a backend framework need to set a header.  Normally you should be using cookies to be more secure, but it depends on your backend.

```html
<button data-on-click="sse('/examples/csrf/data', {
method: 'post',
headers: {
    'x-csrf-token':'/Svi7DzhybrN+mDfI0zpReDj31ZZpp7GFp5KC6yMvGKer5OmslH1fpYDtAfsTwmfH+yLy7ghTAVHiRcjDz8XAQ=='
}})">Send update</button>
<div>
    <label>Response</label>
    <div id="responses"></div>
</div>
```

## Demo

<div id="update_me" data-on-load="sse('/examples/csrf/data')">Update Me</div>
