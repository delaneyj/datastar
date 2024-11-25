package StarFederation.Datastar.events;

import StarFederation.Datastar.enums.EventType;
import static StarFederation.Datastar.Consts.*;

import java.util.*;

public class MergeFragments extends AbstractSSEEvent {

    private final String data;
    private final MergeFragmentsOptions mergeFragmentsOptions;

    public MergeFragments(String data, MergeFragmentsOptions mergeFragmentsOptions) {
        super();
        if (data == null || data.isBlank()) {
            throw new IllegalArgumentException("Data cannot be null or empty.");
        }
        this.data = data.trim();
        this.mergeFragmentsOptions = Objects.requireNonNullElse(mergeFragmentsOptions, MergeFragmentsOptions.create());
    }

    @Override
    public EventType getEventType() {
        return EventType.MergeFragments;
    }

    public String[] getDataLines() {
        List<String> dataLines = new ArrayList<>();

        // Add Selector if Present
        addDataLineIfNotEmpty(dataLines, SELECTOR_DATALINE_LITERAL, mergeFragmentsOptions.getSelector());

        addDataLineIfNotDefault(
                dataLines, MERGE_MODE_DATALINE_LITERAL, mergeFragmentsOptions.getMergeMode().getValue(), DEFAULT_FRAGMENT_MERGE_MODE.getValue()
        );

        addDataLineIfNotDefault(
                dataLines, SETTLE_DURATION_DATALINE_LITERAL, mergeFragmentsOptions.getSettleDuration(), DEFAULT_SETTLE_DURATION
        );

        if (mergeFragmentsOptions.isUseViewTransition()) {
            dataLines.add(getDataLine(USE_VIEW_TRANSITION_DATALINE_LITERAL, getBooleanAsString(true)));
        }

        Arrays.stream(data.split("\n"))
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .forEach(line -> dataLines.add(getDataLine(FRAGMENTS_DATALINE_LITERAL, line)));

        return dataLines.toArray(String[]::new);
    }
}
