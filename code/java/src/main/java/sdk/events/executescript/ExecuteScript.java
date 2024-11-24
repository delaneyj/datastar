package sdk.events.executescript;

import sdk.events.SSEOptions;
import sdk.enums.EventType;
import sdk.events.EventInterface;

import java.util.*;

import static sdk.Consts.*;

public class ExecuteScript implements EventInterface {

    private final String script;
    private final SSEOptions sseOptions;
    private final ExecuteScriptOptions executeScriptOptions;

    // Primary Constructor
    public ExecuteScript(String script, SSEOptions sseOptions, ExecuteScriptOptions executeScriptOptions) {
        if (script == null || script.isBlank()) {
            throw new IllegalArgumentException("Script cannot be null or empty.");
        }
        this.script = script.trim();
        this.sseOptions = Objects.requireNonNullElse(sseOptions, SSEOptions.create());
        this.executeScriptOptions = Objects.requireNonNullElse(executeScriptOptions, ExecuteScriptOptions.create());
    }

    @Override
    public EventType getEventType() {
        return EventType.EXECUTE_SCRIPT;
    }

    @Override
    public Map<String, Object> getOptions() {
        Map<String, Object> options = new HashMap<>();
        if (sseOptions.getEventId() != null) {
            options.put(EVENT_ID_DATALINE_LITERAL, sseOptions.getEventId());
        }
        if (sseOptions.getRetryDuration() != DEFAULT_SSE_RETRY_DURATION) {
            options.put(RETRY_DURATION_DATALINE_LITERAL, sseOptions.getRetryDuration());
        }
        return options;
    }

    @Override
    public String[] getDataLines() {
        List<String> dataLines = new ArrayList<>();

        // Add autoRemove if false
        if (!executeScriptOptions.isAutoRemove()) {
            dataLines.add(getDataLine(AUTO_REMOVE_DATALINE_LITERAL, getBooleanAsString(false)));
        }

        // Add attributes if not default
        if (!executeScriptOptions.getAttributes().equals("type module")) {
            Arrays.stream(executeScriptOptions.getAttributes().split("\n"))
                    .map(String::trim)
                    .filter(line -> !line.isEmpty())
                    .forEach(attr -> dataLines.add(getDataLine(ATTRIBUTES_DATALINE_LITERAL, attr)));
        }

        // Add script content line by line
        Arrays.stream(script.split("\n"))
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .forEach(line -> dataLines.add(getDataLine(SCRIPT_DATALINE_LITERAL, line)));

        return dataLines.toArray(String[]::new);
    }

    @Override
    public String getBooleanAsString(boolean value) {
        return value ? "true" : "false";
    }

    @Override
    public String getDataLine(String key, String value) {
        return "data: " + key + " " + value;
    }
}
