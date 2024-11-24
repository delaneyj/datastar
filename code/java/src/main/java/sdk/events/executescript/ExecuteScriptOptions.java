package sdk.events.executescript;

public class ExecuteScriptOptions {

    private boolean autoRemove = true; // Default to true
    private String attributes = "type module"; // Default to "type module"

    // Private constructor to enforce use of the builder
    private ExecuteScriptOptions() {}

    // Static factory method to start building options
    public static ExecuteScriptOptions create() {
        return new ExecuteScriptOptions();
    }

    // Builder methods
    public ExecuteScriptOptions withAutoRemove(boolean autoRemove) {
        this.autoRemove = autoRemove;
        return this;
    }

    public ExecuteScriptOptions withAttributes(String attributes) {
        this.attributes = (attributes != null && !attributes.isBlank()) ? attributes : "type module"; // Default to "type module"
        return this;
    }

    // Getters
    public boolean isAutoRemove() {
        return autoRemove;
    }

    public String getAttributes() {
        return attributes;
    }

    @Override
    public String toString() {
        return "ExecuteScriptOptions{" +
                "autoRemove=" + autoRemove +
                ", attributes='" + attributes + '\'' +
                '}';
    }
}
