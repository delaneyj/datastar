<?php

use starfederation\datastar\Consts;
use starfederation\datastar\enums\FragmentMergeMode;
use starfederation\datastar\events\MergeFragments;

test('Options are correctly output', function() {
    $content = '<div>content</div>';
    $event = new MergeFragments($content, [
        'selector' => 'selector',
        'mergeMode' => FragmentMergeMode::Append,
        'settleDuration' => 1000,
        'useViewTransition' => true,
    ]);
    expect($event->getDataLines())
        ->toBe([
            'data: selector selector',
            'data: mergeMode append',
            'data: settleDuration 1000',
            'data: useViewTransition true',
            'data: fragments ' . $content,
        ]);
});

test('Default options are not output', function() {
    $content = '<div>content</div>';
    $event = new MergeFragments($content, [
        'selector' => '',
        'mergeMode' => FragmentMergeMode::Morph,
        'settleDuration' => Consts::DEFAULT_SETTLE_DURATION,
        'useViewTransition' => false,
    ]);
    expect($event->getDataLines())
        ->toBe([
            'data: fragments ' . $content,
        ]);
});

test('Multi-line content is correctly output', function() {
    $content = '<div>content</div>';
    $event = new MergeFragments("\n" . $content . "\n" . $content . "\n");
    expect($event->getDataLines())
        ->toBe([
            'data: fragments ' . $content,
            'data: fragments ' . $content,
        ]);
});
