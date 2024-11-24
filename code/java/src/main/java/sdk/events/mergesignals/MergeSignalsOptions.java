package sdk.events.mergesignals;

public class MergeSignalsOptions {

    private boolean onlyIfMissing = false; // Default to false

    // Private constructor to enforce the builder pattern
    private MergeSignalsOptions() {}

    // Static factory method to start building options
    public static MergeSignalsOptions create() {
        return new MergeSignalsOptions();
    }

    // Builder methods
    public MergeSignalsOptions withOnlyIfMissing(boolean onlyIfMissing) {
        this.onlyIfMissing = onlyIfMissing;
        return this;
    }

    // Getters
    public boolean isOnlyIfMissing() {
        return onlyIfMissing;
    }

    @Override
    public String toString() {
        return "MergeSignalsOptions{" +
                "onlyIfMissing=" + onlyIfMissing +
                '}';
    }
}
