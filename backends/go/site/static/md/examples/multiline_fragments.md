## Multiline Fragments

## Demo

<div id="replaceMe" data-on-load="$$get('/examples/multiline_fragments/data')">
</div>

## Explanation

As long as the fragment has a newline at the end of the line it will be treated as a multiline fragment. This is useful when you are writing a lot of text by hand.

```text
event: datastar-fragment
data: merge morph
data: settle 500
data: fragment
data: <div id="replaceMe">
data:   <pre>
data: This is a multiline fragment.
data:
data: Used when you are writing a lot of text by hand
data: 	</pre>
data: </div>
```
