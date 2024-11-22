use starfederation\datastar\ServerSentEventGenerator;

// Creates a new `ServerSentEventGenerator` instance.
$sseGenerator = new ServerSentEventGenerator();

// Merges HTML fragments into the DOM.
$sseGenerator->mergeFragments(
    '<div id="question">What do you put in a toaster?</div>'
);

// Merges signals into the store.
$sseGenerator->mergeSignals(['response' => '', 'answer' => 'bread']);
