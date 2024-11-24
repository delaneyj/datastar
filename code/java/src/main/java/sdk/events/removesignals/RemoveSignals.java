package sdk.events.removesignals;

import sdk.enums.EventType;
import sdk.events.EventInterface;
import sdk.events.SSEOptions;

import java.util.*;

import static sdk.Consts.*;

public class RemoveSignals implements EventInterface {

    private final List<String> paths;
    private final SSEOptions sseOptions;

    public RemoveSignals(List<String> paths, SSEOptions sseOptions) {
        if (paths == null || paths.isEmpty()) {
            throw new IllegalArgumentException("Paths cannot be null or empty.");
        }
        this.paths = new ArrayList<>(paths);
        this.sseOptions = Objects.requireNonNullElse(sseOptions, SSEOptions.create());
    }

    @Override
    public EventType getEventType() {
        return EventType.REMOVE_SIGNALS;
    }

    @Override
    public Map<String, Object> getOptions() {
        Map<String, Object> optionMap = new HashMap<>();
        if (sseOptions.getEventId() != null) {
            optionMap.put(EVENT_ID_DATALINE_LITERAL, sseOptions.getEventId());
        }
        if (sseOptions.getRetryDuration() != DEFAULT_SSE_RETRY_DURATION) {
            optionMap.put(RETRY_DURATION_DATALINE_LITERAL, sseOptions.getRetryDuration());
        }
        return optionMap;
    }

    @Override
    public String[] getDataLines() {
        List<String> dataLines = new ArrayList<>();

        // Add paths as a space-separated string
        String joinedPaths = String.join(" ", paths);
        dataLines.add(getDataLine(PATHS_DATALINE_LITERAL, joinedPaths));

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
