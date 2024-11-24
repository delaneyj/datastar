<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace starfederation\datastar;

use starfederation\datastar\enums\EventType;
use starfederation\datastar\enums\FragmentMergeMode;
use starfederation\datastar\events\EventInterface;
use starfederation\datastar\events\ExecuteScript;
use starfederation\datastar\events\MergeFragments;
use starfederation\datastar\events\MergeSignals;
use starfederation\datastar\events\RemoveFragments;
use starfederation\datastar\events\RemoveSignals;

class ServerSentEventGenerator
{
    public function __construct()
    {
        $this->sendHeaders();
    }

    /**
     * Merges HTML fragments into the DOM.
     *
     * @param array{
     *     selector?: string|null,
     *     mergeMode?: FragmentMergeMode|null,
     *     settleDuration?: int|null,
     *     useViewTransition?: bool|null,
     *     eventId?: string|null,
     *     retryDuration?: int|null,
     * } $options
     */
    public function mergeFragments(string $fragments, array $options = []): void
    {
        $this->sendEvent(new MergeFragments($fragments, $options));
    }

    /**
     * Removes HTML fragments from the DOM.
     *
     * @param array{
     *      eventId?: string|null,
     *      retryDuration?: int|null,
     *  } $options
     */
    public function removeFragments(string $selector, array $options = []): void
    {
        $this->sendEvent(new RemoveFragments($selector, $options));
    }

    /**
     * Merges signals into the store.
     */
    public function mergeSignals(array|string $signals, array $options = []): void
    {
        $this->sendEvent(new MergeSignals($signals, $options));
    }

    /**
     * Removes signal paths from the store.
     */
    public function removeSignals(array $paths, array $options = []): void
    {
        $this->sendEvent(new RemoveSignals($paths, $options));
    }

    /**
     * Executes JavaScript in the browser.
     */
    public function executeScript(string $script, array $options = []): void
    {
        $this->sendEvent(new ExecuteScript($script, $options));
    }

    /**
     * Sends the response headers, if not already sent.
     */
    protected function sendHeaders(): void
    {
        if (headers_sent()) {
            return;
        }

        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');

        // Disable buffering for Nginx
        // https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffering
        header('X-Accel-Buffering: no');
    }

    /**
     * Sends an event.
     */
    protected function sendEvent(EventInterface $event): void
    {
        $this->send(
            $event->getEventType(),
            $event->getDataLines(),
            $event->getOptions(),
        );
    }

    /**
     * Sends a Datastar event.
     *
     * @param EventType $eventType
     * @param string[] $dataLines
     * @param array{
     *     eventId?: string|null,
     *     retryDuration?: int|null,
     * } $options
     */
    protected function send(EventType $eventType, array $dataLines, array $options = []): void
    {
        $eventData = new ServerSentEventData(
            $eventType,
            $dataLines,
            $options['eventId'] ?? null,
            $options['retryDuration'] ?? Consts::DEFAULT_SSE_RETRY_DURATION,
        );

        foreach ($options as $key => $value) {
            $eventData->$key = $value;
        }

        $output = ['event: ' . $eventData->eventType->value];

        if ($eventData->eventId !== null) {
            $output[] = 'id: ' . $eventData->eventId;
        }

        $output[] = 'retry: ' . $eventData->retryDuration;

        foreach ($eventData->data as $line) {
            $output[] = $line;
        }

        echo implode("\n", $output) . "\n\n";

        if (ob_get_contents()) {
            ob_end_flush();
        }
        flush();
    }
}
