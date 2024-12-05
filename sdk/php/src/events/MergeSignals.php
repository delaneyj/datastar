<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace starfederation\datastar\events;

use starfederation\datastar\Consts;
use starfederation\datastar\enums\EventType;

class MergeSignals implements EventInterface
{
    use EventTrait;

    public array|string $signals;
    public bool $onlyIfMissing = Consts::DEFAULT_MERGE_SIGNALS_ONLY_IF_MISSING;

    public function __construct(array|string $signals, array $options = [])
    {
        $this->signals = $signals;

        foreach ($options as $key => $value) {
            $this->$key = $value;
        }
    }

    /**
     * @inerhitdoc
     */
    public function getEventType(): EventType
    {
        return EventType::MergeSignals;
    }

    /**
     * @inerhitdoc
     */
    public function getDataLines(): array
    {
        $dataLines = [];

        if ($this->onlyIfMissing !== Consts::DEFAULT_MERGE_SIGNALS_ONLY_IF_MISSING) {
            $dataLines[] = $this->getDataLine(Consts::ONLY_IF_MISSING_DATALINE_LITERAL, $this->getBooleanAsString($this->onlyIfMissing));
        }

        $data = is_array($this->signals) ? json_encode($this->signals) : $this->signals;

        return array_merge(
            $dataLines,
            $this->getMultiDataLines(Consts::SIGNALS_DATALINE_LITERAL, $data),
        );
    }
}
