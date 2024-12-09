package StarFederation.Datastar.events;

import java.util.Objects;

import static StarFederation.Datastar.Consts.DEFAULT_MERGE_SIGNALS_ONLY_IF_MISSING;

public class MergeSignalsOptions {

    private boolean onlyIfMissing = DEFAULT_MERGE_SIGNALS_ONLY_IF_MISSING;

    private MergeSignalsOptions() {}

    public static MergeSignalsOptions create() {
        return new MergeSignalsOptions();
    }

    public MergeSignalsOptions withOnlyIfMissing(boolean onlyIfMissing) {
        this.onlyIfMissing = onlyIfMissing;
        return this;
    }

    public boolean isOnlyIfMissing() {
        return onlyIfMissing;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MergeSignalsOptions that = (MergeSignalsOptions) o;
        return onlyIfMissing == that.onlyIfMissing;
    }

    @Override
    public int hashCode() {
        return Objects.hash(onlyIfMissing);
    }

    @Override
    public String toString() {
        return "MergeSignalsOptions{" +
                "onlyIfMissing=" + onlyIfMissing +
                '}';
    }
}
