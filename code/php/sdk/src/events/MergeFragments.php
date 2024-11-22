<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace starfederation\datastar\events;

use starfederation\datastar\Consts;
use starfederation\datastar\enums\EventType;
use starfederation\datastar\enums\FragmentMergeMode;

class MergeFragments implements EventInterface
{
    use EventTrait;

    public string $data;
    public string $selector = '';
    public FragmentMergeMode $mergeMode = Consts::DEFAULT_FRAGMENT_MERGE_MODE;
    public int $settleDuration = Consts::DEFAULT_SETTLE_DURATION;
    public bool $useViewTransition = Consts::DEFAULT_FRAGMENTS_USE_VIEW_TRANSITIONS;

    public function __construct(string $data, array $options = [])
    {
        $this->data = $data;

        foreach ($options as $key => $value) {
            $this->$key = $value;
        }
    }

    /**
     * @inerhitdoc
     */
    public function getEventType(): EventType
    {
        return EventType::MergeFragments;
    }

    /**
     * @inerhitdoc
     */
    public function getDataLines(): array
    {
        $dataLines = [];

        if (!empty($this->selector)) {
            $dataLines[] = $this->getDataLine(Consts::SELECTOR_DATALINE_LITERAL, $this->selector);
        }

        if ($this->mergeMode !== Consts::DEFAULT_FRAGMENT_MERGE_MODE) {
            $dataLines[] = $this->getDataLine(Consts::MERGE_MODE_DATALINE_LITERAL, $this->mergeMode->value);
        }

        if ($this->settleDuration != Consts::DEFAULT_SETTLE_DURATION) {
            $dataLines[] = $this->getDataLine(Consts::SETTLE_DURATION_DATALINE_LITERAL, $this->settleDuration);
        }

        if ($this->useViewTransition !== Consts::DEFAULT_FRAGMENTS_USE_VIEW_TRANSITIONS) {
            $dataLines[] = $this->getDataLine(Consts::USE_VIEW_TRANSITION_DATALINE_LITERAL, $this->getBooleanAsString($this->useViewTransition));
        }

        return array_merge(
            $dataLines,
            $this->getMultiDataLines(Consts::FRAGMENTS_DATALINE_LITERAL, $this->data),
        );
    }
}
