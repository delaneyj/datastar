<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace starfederation\datastar\events;

use starfederation\datastar\Consts;
use starfederation\datastar\enums\EventType;

class ExecuteScript implements EventInterface
{
    use EventTrait;

    public string $data;
    public bool $autoRemove = Consts::DEFAULT_EXECUTE_SCRIPT_AUTO_REMOVE;
    public array $attributes = [];

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
        return EventType::ExecuteScript;
    }

    /**
     * @inerhitdoc
     */
    public function getDataLines(): array
    {
        $dataLines = [];

        if ($this->autoRemove !== Consts::DEFAULT_EXECUTE_SCRIPT_AUTO_REMOVE) {
            $dataLines[] = $this->getDataLine(Consts::AUTO_REMOVE_DATALINE_LITERAL, $this->getBooleanAsString($this->autoRemove));
        }

        // Convert key-value pairs to space-separated values.
        $attributes = [];
        foreach ($this->attributes as $key => $value) {
            // If attribute value is a boolean, skip or set to `true`.
            if (is_bool($value)) {
                if ($value === false) {
                    continue;
                }
                $value = '';
            }
            $attributes[] = is_numeric($key) ? $value : $key . ' ' . $value;
        }
        $attributesJoined = join("\n", $attributes);
        if ($attributesJoined !== Consts::DEFAULT_EXECUTE_SCRIPT_ATTRIBUTES) {
            foreach ($attributes as $attributeLine) {
                $dataLines[] = $this->getDataLine(Consts::ATTRIBUTES_DATALINE_LITERAL, $attributeLine);
            }
        }

        return array_merge(
            $dataLines,
            $this->getMultiDataLines(Consts::SCRIPT_DATALINE_LITERAL, $this->data),
        );
    }
}
