<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace starfederation\datastar\events;

use starfederation\datastar\Consts;

trait EventTrait
{
    public ?string $eventId = null;
    public ?int $retryDuration = null;

    /**
     * @inerhitdoc
     */
    public function getOptions(): array
    {
        $options = [];

        if (!empty($this->eventId)) {
            $options['eventId'] = $this->eventId;
        }

        if (!empty($this->retryDuration) && $this->retryDuration != Consts::DEFAULT_SSE_RETRY_DURATION) {
            $options['retryDuration'] = $this->retryDuration;
        }

        return $options;
    }

    /**
     * @inerhitdoc
     */
    public function getBooleanAsString(bool $value): string
    {
        return $value ? 'true' : 'false';
    }

    /**
     * @inerhitdoc
     */
    public function getDataLine(string $datalineLiteral, string|int ...$parts): string
    {
        return 'data: ' . $datalineLiteral . implode(' ', $parts);
    }

    /**
     * @inerhitdoc
     */
    public function getMultiDataLines(string $datalineLiteral, string $data): array
    {
        $dataLines = [];
        $lines = explode("\n", trim($data));

        foreach ($lines as $line) {
            $dataLines[] = $this->getDataLine($datalineLiteral, $line);
        }

        return $dataLines;
    }
}
