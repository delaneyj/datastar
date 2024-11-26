<?php
/**
 * @copyright Copyright (c) PutYourLightsOn
 */

namespace starfederation\datastar;

class ReadSignals
{
    /**
     * Returns the store from the incoming request.
     */
    public static function getStore(): array
    {
        $input = $_GET[Consts::DATASTAR_KEY] ?? file_get_contents('php://input');

        return $input ? json_decode($input, true) : [];
    }
}
