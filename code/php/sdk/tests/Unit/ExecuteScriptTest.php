<?php

use starfederation\datastar\events\ExecuteScript;

test('Event is correctly output', function() {
    $content = 'console.log("Hello, world!")';
    $event = new ExecuteScript($content, [
        'autoRemove' => false,
        'attributes' => ['type module', 'defer'],
    ]);
    expect($event->getDataLines())
        ->toBe([
            'data: autoRemove false',
            'data: attributes type module',
            'data: attributes defer',
            'data: script ' . $content,
        ]);
});

test('Default options are not output', function() {
    $content = 'console.log("Hello, world!")';
    $event = new ExecuteScript($content, [
        'autoRemove' => true,
        'attributes' => ['type module'],
    ]);
    expect($event->getDataLines())
        ->toBe([
            'data: script ' . $content,
        ]);
});

test('Multi-line content is correctly output', function() {
    $content = 'console.log("Hello, world!")';
    $event = new ExecuteScript("\n" . $content . "\n" . $content . "\n");
    expect($event->getDataLines())
        ->toBe([
            'data: script ' . $content,
            'data: script ' . $content,
        ]);
});

test('Attributes can be passed in as array', function() {
    $content = 'console.log("Hello, world!")';
    $event = new ExecuteScript($content, [
        'attributes' => ['type' => 'module', 'defer' => true, 'x' => false],
    ]);
    expect($event->getDataLines())
        ->toBe([
            'data: attributes type module',
            'data: attributes defer ',
            'data: script ' . $content,
        ]);
});
