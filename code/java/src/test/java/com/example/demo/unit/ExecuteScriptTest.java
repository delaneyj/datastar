package com.example.demo.unit;

import org.junit.jupiter.api.Test;
import sdk.events.SSEOptions;
import sdk.events.executescript.ExecuteScript;
import sdk.events.executescript.ExecuteScriptOptions;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ExecuteScriptTest {

    @Test
    void testExecuteScriptWithDefaultOptions() {
        String script = "console.log('Hello, world!');";

        // Create an instance of ExecuteScript
        ExecuteScript executeScript = new ExecuteScript(script, null, null);

        // Assert event type
        assertEquals("datastar-execute-script", executeScript.getEventType().getValue());

        // Assert options
        Map<String, Object> options = executeScript.getOptions();
        assertTrue(options.isEmpty(), "Default options should not add anything to options map.");

        // Assert data lines
        String[] dataLines = executeScript.getDataLines();
        assertEquals(1, dataLines.length, "Only one line of script should be present.");
        assertEquals("data: script console.log('Hello, world!');", dataLines[0]);
    }

    @Test
    void testExecuteScriptWithCustomOptions() {
        String script = "alert('Test');";
        SSEOptions sseOptions = SSEOptions.create()
                .withEventId("12345")
                .withRetryDuration(3000);

        ExecuteScriptOptions executeScriptOptions = ExecuteScriptOptions.create()
                .withAutoRemove(false)
                .withAttributes("async defer");

        // Create an instance of ExecuteScript with options
        ExecuteScript executeScript = new ExecuteScript(script, sseOptions, executeScriptOptions);

        // Assert event type
        assertEquals("datastar-execute-script", executeScript.getEventType().getValue());

        // Assert options
        Map<String, Object> options = executeScript.getOptions();
        assertEquals(2, options.size());
        assertEquals("12345", options.get("id"));
        assertEquals(3000, options.get("retryDuration"));

        // Assert data lines
        String[] dataLines = executeScript.getDataLines();
        assertEquals(3, dataLines.length); // Two attributes and one script line

        assertEquals("data: autoRemove false", dataLines[0]);
        assertEquals("data: attributes async defer", dataLines[1]);
        assertTrue(dataLines[2].startsWith("data: script alert('Test');"));
    }

    @Test
    void testInvalidScript() {
        assertThrows(IllegalArgumentException.class, () -> new ExecuteScript(null, null, null));
        assertThrows(IllegalArgumentException.class, () -> new ExecuteScript("   ", null, null));
    }

    @Test
    void testDefaultBehaviorWithNoOptions() {
        String script = "console.log('Default behavior');";

        // Create ExecuteScript with default options
        ExecuteScript executeScript = new ExecuteScript(script, null, null);

        // Assert event type
        assertEquals("datastar-execute-script", executeScript.getEventType().getValue());

        // Assert options are empty
        assertTrue(executeScript.getOptions().isEmpty());

        // Assert data lines contain only the script
        String[] dataLines = executeScript.getDataLines();
        assertEquals(1, dataLines.length);
        assertEquals("data: script console.log('Default behavior');", dataLines[0]);
    }

    @Test
    void testCustomAttributes() {
        String script = "console.log('Attributes test');";
        ExecuteScriptOptions executeScriptOptions = ExecuteScriptOptions.create()
                .withAttributes("async\ncrossorigin anonymous");

        // Create ExecuteScript
        ExecuteScript executeScript = new ExecuteScript(script, null, executeScriptOptions);

        // Assert data lines
        String[] dataLines = executeScript.getDataLines();
        assertEquals(3, dataLines.length); // Two attributes and one script line

        assertEquals("data: attributes async", dataLines[0]);
        assertEquals("data: attributes crossorigin anonymous", dataLines[1]);
        assertTrue(dataLines[2].startsWith("data: script console.log('Attributes test');"));
    }
}
