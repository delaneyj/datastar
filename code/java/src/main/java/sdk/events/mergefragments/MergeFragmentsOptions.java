package sdk.events.mergefragments;

import sdk.Consts;
import sdk.enums.FragmentMergeMode;

public class MergeFragmentsOptions {
    private String selector = ""; // Default to empty selector
    private FragmentMergeMode mergeMode = Consts.DEFAULT_FRAGMENT_MERGE_MODE; // Default to MORPH
    private int settleDuration = Consts.DEFAULT_SETTLE_DURATION; // Default to 300ms
    private boolean useViewTransition = false; // Default to false

    // Private constructor to enforce use of the builder
    private MergeFragmentsOptions() {}

    // Static factory method to start building options
    public static MergeFragmentsOptions create() {
        return new MergeFragmentsOptions();
    }

    // Builder methods
    public MergeFragmentsOptions withSelector(String selector) {
        this.selector = (selector != null && !selector.isBlank()) ? selector : ""; // Default to empty
        return this;
    }

    public MergeFragmentsOptions withMergeMode(FragmentMergeMode mergeMode) {
        this.mergeMode = mergeMode != null ? mergeMode : Consts.DEFAULT_FRAGMENT_MERGE_MODE; // Default to MORPH
        return this;
    }

    public MergeFragmentsOptions withSettleDuration(int settleDuration) {
        this.settleDuration = settleDuration > 0 ? settleDuration : Consts.DEFAULT_SETTLE_DURATION; // Default to 300ms
        return this;
    }

    public MergeFragmentsOptions withViewTransition(boolean useViewTransition) {
        this.useViewTransition = useViewTransition; // Default is already false
        return this;
    }

    // Getters
    public String getSelector() {
        return selector;
    }

    public FragmentMergeMode getMergeMode() {
        return mergeMode;
    }

    public int getSettleDuration() {
        return settleDuration;
    }

    public boolean isUseViewTransition() {
        return useViewTransition;
    }

    @Override
    public String toString() {
        return "MergeFragmentsOptions{" +
                "selector='" + selector + '\'' +
                ", mergeMode=" + mergeMode +
                ", settleDuration=" + settleDuration +
                ", useViewTransition=" + useViewTransition +
                '}';
    }
}
