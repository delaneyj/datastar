package sdk.events.mergefragments;

import sdk.Consts;
import sdk.events.SSEOptions;
import sdk.enums.EventType;
import sdk.events.EventInterface;

import java.util.*;

import static sdk.Consts.*;

public class MergeFragments implements EventInterface {

    private final String data;
    private final SSEOptions sseOptions;
    private final MergeFragmentsOptions mergeFragmentsOptions;

    // Primary Constructor
    public MergeFragments(String data, SSEOptions sseOptions, MergeFragmentsOptions mergeFragmentsOptions) {
        if (data == null || data.isBlank()) {
            throw new IllegalArgumentException("Data cannot be null or empty.");
        }
        this.data = data.trim();
        this.sseOptions = Objects.requireNonNullElse(sseOptions, SSEOptions.create());
        this.mergeFragmentsOptions = Objects.requireNonNullElse(mergeFragmentsOptions, MergeFragmentsOptions.create());
    }

    @Override
    public EventType getEventType() {
        return EventType.MERGE_FRAGMENTS;
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

        // Add Selector if Present
        addDataLineIfNotEmpty(dataLines, Consts.SELECTOR_DATALINE_LITERAL, mergeFragmentsOptions.getSelector());

        // Add Merge Mode if Different from Default
        addDataLineIfNotDefault(
                dataLines, Consts.MERGE_MODE_DATALINE_LITERAL, mergeFragmentsOptions.getMergeMode(), Consts.DEFAULT_FRAGMENT_MERGE_MODE
        );

        // Add Settle Duration if Different from Default
        addDataLineIfNotDefault(
                dataLines, Consts.SETTLE_DURATION_DATALINE_LITERAL, mergeFragmentsOptions.getSettleDuration(), Consts.DEFAULT_SETTLE_DURATION
        );

        // Add View Transition if True
        if (mergeFragmentsOptions.isUseViewTransition()) {
            dataLines.add(getDataLine(Consts.USE_VIEW_TRANSITION_DATALINE_LITERAL, getBooleanAsString(true)));
        }

        // Add Fragment Data Lines
        Arrays.stream(data.split("\n"))
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .forEach(line -> dataLines.add(getDataLine(Consts.FRAGMENTS_DATALINE_LITERAL, line)));

        return dataLines.toArray(String[]::new);
    }

    private void addDataLineIfNotEmpty(List<String> dataLines, String key, String value) {
        if (value != null && !value.isEmpty()) {
            dataLines.add(getDataLine(key, value));
        }
    }

    private <T> void addDataLineIfNotDefault(List<String> dataLines, String key, T value, T defaultValue) {
        if (!Objects.equals(value, defaultValue)) {
            dataLines.add(getDataLine(key, value.toString()));
        }
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
