package sdk.events.removefragments;

import sdk.Consts;
import sdk.enums.EventType;
import sdk.events.EventInterface;
import sdk.events.SSEOptions;

import java.util.*;

import static sdk.Consts.*;

public class RemoveFragments implements EventInterface {

    private final String selector;
    private final SSEOptions sseOptions;
    private final RemoveFragmentsOptions removeFragmentsOptions;

    // Primary Constructor
    public RemoveFragments(String selector, SSEOptions sseOptions, RemoveFragmentsOptions removeFragmentsOptions) {
        if (selector == null || selector.isBlank()) {
            throw new IllegalArgumentException("Selector cannot be null or empty.");
        }
        this.selector = selector.trim();
        this.sseOptions = Objects.requireNonNullElse(sseOptions, SSEOptions.create());
        this.removeFragmentsOptions = Objects.requireNonNullElse(removeFragmentsOptions, RemoveFragmentsOptions.create());
    }

    @Override
    public EventType getEventType() {
        return EventType.REMOVE_FRAGMENTS;
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

        // Add selector
        dataLines.add(getDataLine(Consts.SELECTOR_DATALINE_LITERAL, selector));

        // Add settle duration if not default
        if (removeFragmentsOptions.getSettleDuration() != Consts.DEFAULT_SETTLE_DURATION) {
            dataLines.add(getDataLine(Consts.SETTLE_DURATION_DATALINE_LITERAL, Integer.toString(removeFragmentsOptions.getSettleDuration())));
        }

        // Add view transition if true
        if (removeFragmentsOptions.isUseViewTransition()) {
            dataLines.add(getDataLine(Consts.USE_VIEW_TRANSITION_DATALINE_LITERAL, getBooleanAsString(true)));
        }

        return dataLines.toArray(new String[0]);
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
