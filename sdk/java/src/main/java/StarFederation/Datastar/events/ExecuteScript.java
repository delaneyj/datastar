package StarFederation.Datastar.events;

import StarFederation.Datastar.enums.EventType;
import static StarFederation.Datastar.Consts.*;

import java.util.*;

public class ExecuteScript extends AbstractSSEEvent {

    private final String script;
    private final ExecuteScriptOptions executeScriptOptions;

    // Primary Constructor
    public ExecuteScript(String script, ExecuteScriptOptions executeScriptOptions) {
        if (script == null || script.isBlank()) {
            throw new IllegalArgumentException("Script cannot be null or empty.");
        }
        this.script = script.trim();
        this.executeScriptOptions = Objects.requireNonNullElse(executeScriptOptions, ExecuteScriptOptions.create());
    }

    @Override
    public EventType getEventType() {
        return EventType.ExecuteScript;
    }

    public String[] getDataLines() {
        List<String> dataLines = new ArrayList<>();

        // Add autoRemove if not true (default is true)
        addDataLineIfNotDefault(dataLines, AUTO_REMOVE_DATALINE_LITERAL, executeScriptOptions.isAutoRemove(), true);

        // Add attributes if not default
        addDataLineIfNotDefault(dataLines, ATTRIBUTES_DATALINE_LITERAL, executeScriptOptions.getAttributes(), "type module");

        // Add script content line by line
        Arrays.stream(script.split("\n"))
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .forEach(line -> dataLines.add(getDataLine(SCRIPT_DATALINE_LITERAL, line)));

        return dataLines.toArray(String[]::new);
    }
}
