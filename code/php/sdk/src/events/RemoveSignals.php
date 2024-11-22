<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace starfederation\datastar\events;

use starfederation\datastar\Consts;
use starfederation\datastar\enums\EventType;

class RemoveSignals implements EventInterface
{
    use EventTrait;

    public ?array $paths;

    public function __construct(array $paths = null, array $options = [])
    {
        $this->paths = $paths;

        foreach ($options as $key => $value) {
            $this->$key = $value;
        }
    }

    /**
     * @inerhitdoc
     */
    public function getEventType(): EventType
    {
        return EventType::RemoveSignals;
    }

    /**
     * @inerhitdoc
     */
    public function getDataLines(): array
    {
        return [
            $this->getDataLine(Consts::PATHS_DATALINE_LITERAL, ...$this->paths),
        ];
    }
}
