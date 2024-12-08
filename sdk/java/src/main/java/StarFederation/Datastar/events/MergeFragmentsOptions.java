package StarFederation.Datastar.events;

import StarFederation.Datastar.enums.FragmentMergeMode;

import java.util.Objects;

import static StarFederation.Datastar.Consts.*;

public class MergeFragmentsOptions {

    private String selector = "";
    private FragmentMergeMode mergeMode = DEFAULT_FRAGMENT_MERGE_MODE;
    private int settleDuration = DEFAULT_SETTLE_DURATION;
    private boolean useViewTransition = DEFAULT_FRAGMENTS_USE_VIEW_TRANSITIONS;

    private MergeFragmentsOptions() {}

    public static MergeFragmentsOptions create() {
        return new MergeFragmentsOptions();
    }

    public MergeFragmentsOptions withSelector(String selector) {
        this.selector = (selector != null && !selector.isBlank()) ? selector.trim() : "";
        return this;
    }

    public MergeFragmentsOptions withMergeMode(FragmentMergeMode mergeMode) {
        this.mergeMode = mergeMode != null ? mergeMode : DEFAULT_FRAGMENT_MERGE_MODE;
        return this;
    }

    public MergeFragmentsOptions withSettleDuration(int settleDuration) {
        if (settleDuration <= 0) {
            throw new IllegalArgumentException("Settle duration must be greater than 0.");
        }
        this.settleDuration = settleDuration;
        return this;
    }

    public MergeFragmentsOptions withViewTransition(boolean useViewTransition) {
        this.useViewTransition = useViewTransition;
        return this;
    }

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
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MergeFragmentsOptions that = (MergeFragmentsOptions) o;
        return settleDuration == that.settleDuration &&
                useViewTransition == that.useViewTransition &&
                Objects.equals(selector, that.selector) &&
                mergeMode == that.mergeMode;
    }

    @Override
    public int hashCode() {
        return Objects.hash(selector, mergeMode, settleDuration, useViewTransition);
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
