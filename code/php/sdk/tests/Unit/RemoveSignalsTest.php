<?php

use starfederation\datastar\events\RemoveSignals;

test('Event is correctly output', function() {
    $content = ['x', 'y', 'z'];
    $event = new RemoveSignals(paths: $content);
    expect($event->getDataLines())
        ->toBe([
            'data: paths x y z',
        ]);
});
