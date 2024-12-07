package StarFederation.Datastar.events;

import java.util.Objects;

import static StarFederation.Datastar.Consts.DEFAULT_FRAGMENTS_USE_VIEW_TRANSITIONS;
import static StarFederation.Datastar.Consts.DEFAULT_SETTLE_DURATION;

public class RemoveFragmentsOptions {

    private int settleDuration = DEFAULT_SETTLE_DURATION;
    private boolean useViewTransition = DEFAULT_FRAGMENTS_USE_VIEW_TRANSITIONS;

    // Private constructor to enforce use of factory method
    private RemoveFragmentsOptions() {}

    // Static factory method to create an instance
    public static RemoveFragmentsOptions create() {
        return new RemoveFragmentsOptions();
    }

    // Builder methods
    public RemoveFragmentsOptions withSettleDuration(int settleDuration) {
        if (settleDuration <= 0) {
            throw new IllegalArgumentException("Settle duration must be greater than 0.");
        }
        this.settleDuration = settleDuration;
        return this;
    }

    public RemoveFragmentsOptions withUseViewTransition(boolean useViewTransition) {
        this.useViewTransition = useViewTransition;
        return this;
    }

    // Getters
    public int getSettleDuration() {
        return settleDuration;
    }

    public boolean isUseViewTransition() {
        return useViewTransition;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RemoveFragmentsOptions that = (RemoveFragmentsOptions) o;
        return settleDuration == that.settleDuration &&
                useViewTransition == that.useViewTransition;
    }

    @Override
    public int hashCode() {
        return Objects.hash(settleDuration, useViewTransition);
    }

    @Override
    public String toString() {
        return "RemoveFragmentsOptions{" +
                "settleDuration=" + settleDuration +
                ", useViewTransition=" + useViewTransition +
                '}';
    }
}
