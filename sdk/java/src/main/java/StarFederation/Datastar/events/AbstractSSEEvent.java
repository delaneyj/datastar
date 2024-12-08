package StarFederation.Datastar.events;

import StarFederation.Datastar.enums.EventType;

import java.util.*;

import static StarFederation.Datastar.Consts.DEFAULT_SSE_RETRY_DURATION;

public abstract class AbstractSSEEvent {

    private String eventId;
    private int retryDuration = DEFAULT_SSE_RETRY_DURATION;

    protected AbstractSSEEvent() {}

    public abstract EventType getEventType();

    public Map<String, Object> getOptions() {
        Map<String, Object> options = new HashMap<>();
        if (eventId != null) {
            options.put("id", eventId);
        }
        if (retryDuration != DEFAULT_SSE_RETRY_DURATION) {
            options.put("retryDuration", retryDuration);
        }
        return options;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public int getRetryDuration() {
        return retryDuration;
    }

    public void setRetryDuration(int retryDuration) {
        if (retryDuration < 0) {
            throw new IllegalArgumentException("Retry duration must be non-negative.");
        }
        this.retryDuration = retryDuration;
    }

    protected void addDataLineIfNotEmpty(List<String> dataLines, String key, String value) {
        if (value != null && !value.isEmpty()) {
            dataLines.add(getDataLine(key, value));
        }
    }

    protected <T> void addDataLineIfNotDefault(List<String> dataLines, String key, T value, T defaultValue) {
        if (!Objects.equals(value, defaultValue)) {
            dataLines.add(getDataLine(key, value.toString()));
        }
    }

    public String getBooleanAsString(boolean value) {
        return value ? "true" : "false";
    }

    public String getDataLine(String key, String value) {
        return "data: " + key + value;
    }
}
