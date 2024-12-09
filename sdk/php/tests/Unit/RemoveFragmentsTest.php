<?php

use starfederation\datastar\Consts;
use starfederation\datastar\events\RemoveFragments;

test('Options are correctly output', function() {
    $content = 'body';
    $event = new RemoveFragments($content, [
        'settleDuration' => 1000,
        'useViewTransition' => true,
    ]);
    expect($event->getDataLines())
        ->toBe([
            'data: selector body',
            'data: settleDuration 1000',
            'data: useViewTransition true',
        ]);
});

test('Default options are not output', function() {
    $content = 'body';
    $event = new RemoveFragments($content, [
        'settleDuration' => Consts::DEFAULT_FRAGMENTS_SETTLE_DURATION,
        'useViewTransition' => false,
    ]);
    expect($event->getDataLines())
        ->toBe([
            'data: selector body',
        ]);
});
