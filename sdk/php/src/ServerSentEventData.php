<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace starfederation\datastar;

use starfederation\datastar\enums\EventType;

class ServerSentEventData
{
    public EventType $eventType;
    public array $data;
    public ?string $eventId;
    public ?int $retryDuration;

    public function __construct(
        EventType $eventType,
        array $data,
        ?string $eventId = null,
        ?int $retryDuration = null,
    ) {
        $this->eventType = $eventType;
        $this->data = $data;
        $this->eventId = $eventId;
        $this->retryDuration = $retryDuration;
    }
}
