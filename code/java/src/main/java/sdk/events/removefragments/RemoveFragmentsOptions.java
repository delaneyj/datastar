package sdk.events.removefragments;

import sdk.Consts;

public class RemoveFragmentsOptions {

    private int settleDuration = Consts.DEFAULT_SETTLE_DURATION; // Default to 300ms
    private boolean useViewTransition = false; // Default to false

    // Private constructor to enforce use of the builder
    private RemoveFragmentsOptions() {}

    // Static factory method to start building options
    public static RemoveFragmentsOptions create() {
        return new RemoveFragmentsOptions();
    }

    // Builder methods
    public RemoveFragmentsOptions withSettleDuration(int settleDuration) {
        if (settleDuration > 0) {
            this.settleDuration = settleDuration;
        }
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
    public String toString() {
        return "RemoveFragmentsOptions{" +
                "settleDuration=" + settleDuration +
                ", useViewTransition=" + useViewTransition +
                '}';
    }
}
