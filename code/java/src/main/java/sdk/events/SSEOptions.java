package sdk.events;

import static sdk.Consts.DEFAULT_SSE_RETRY_DURATION;

public class SSEOptions {

    private String eventId = null;
    private int retryDuration = DEFAULT_SSE_RETRY_DURATION;

    private SSEOptions() {}

    public static SSEOptions create() {
        return new SSEOptions();
    }

    public SSEOptions withEventId(String eventId) {
        this.eventId = eventId;
        return this;
    }

    public SSEOptions withRetryDuration(int retryDuration) {
        if (retryDuration < 0) {
            throw new IllegalArgumentException("Retry duration must be non-negative.");
        }
        this.retryDuration = retryDuration;
        return this;
    }

    public String getEventId() {
        return eventId;
    }

    public int getRetryDuration() {
        return retryDuration;
    }

}
