package StarFederation.Datastar.events;

import java.util.Objects;

import static StarFederation.Datastar.Consts.DEFAULT_EXECUTE_SCRIPT_ATTRIBUTES;

public class ExecuteScriptOptions {

    private boolean autoRemove = true;
    private String attributes = DEFAULT_EXECUTE_SCRIPT_ATTRIBUTES;

    private ExecuteScriptOptions() {}

    public static ExecuteScriptOptions create() {
        return new ExecuteScriptOptions();
    }

    public ExecuteScriptOptions withAutoRemove(boolean autoRemove) {
        this.autoRemove = autoRemove;
        return this;
    }

    public ExecuteScriptOptions withAttributes(String attributes) {
        this.attributes = (attributes != null && !attributes.isBlank()) ? attributes.trim() : DEFAULT_EXECUTE_SCRIPT_ATTRIBUTES;
        return this;
    }

    public boolean isAutoRemove() {
        return autoRemove;
    }

    public String getAttributes() {
        return attributes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ExecuteScriptOptions that = (ExecuteScriptOptions) o;
        return autoRemove == that.autoRemove && Objects.equals(attributes, that.attributes);
    }

    @Override
    public int hashCode() {
        return Objects.hash(autoRemove, attributes);
    }

    @Override
    public String toString() {
        return "ExecuteScriptOptions{" +
                "autoRemove=" + autoRemove +
                ", attributes='" + attributes + '\'' +
                '}';
    }
}
