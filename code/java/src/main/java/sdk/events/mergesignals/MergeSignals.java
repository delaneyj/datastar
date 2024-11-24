package sdk.events.mergesignals;

import sdk.enums.EventType;
import sdk.events.EventInterface;
import sdk.events.SSEOptions;

import java.util.*;

import static sdk.Consts.*;

public class MergeSignals implements EventInterface {

    private final String data;
    private final SSEOptions sseOptions;
    private final MergeSignalsOptions mergeSignalsOptions;

    public MergeSignals(String data, SSEOptions sseOptions, MergeSignalsOptions mergeSignalsOptions) {
        if (data == null || data.isBlank()) {
            throw new IllegalArgumentException("Data cannot be null or empty.");
        }
        this.data = data.trim();
        this.sseOptions = Objects.requireNonNullElse(sseOptions, SSEOptions.create());
        this.mergeSignalsOptions = Objects.requireNonNullElse(mergeSignalsOptions, MergeSignalsOptions.create());
    }

    @Override
    public EventType getEventType() {
        return EventType.MERGE_SIGNALS;
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

        // Add onlyIfMissing if true
        if (mergeSignalsOptions.isOnlyIfMissing()) {
            dataLines.add(getDataLine(ONLY_IF_MISSING_DATALINE_LITERAL, getBooleanAsString(true)));
        }

        // Add data content line by line, prefixed with "signals"
        Arrays.stream(data.split("\n"))
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .forEach(line -> dataLines.add(getDataLine(SIGNALS_DATALINE_LITERAL, line)));

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
