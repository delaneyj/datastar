package StarFederation.Datastar.events;

import StarFederation.Datastar.enums.EventType;
import StarFederation.Datastar.events.AbstractSSEEvent;
import static StarFederation.Datastar.Consts.*;

import java.util.ArrayList;
import java.util.List;

public class RemoveFragments extends AbstractSSEEvent {

    private final String selector;
    private final RemoveFragmentsOptions removeFragmentsOptions;

    public RemoveFragments(String selector, RemoveFragmentsOptions removeFragmentsOptions) {
        super();
        if (selector == null || selector.isBlank()) {
            throw new IllegalArgumentException("Selector cannot be null or empty.");
        }
        this.selector = selector.trim();
        this.removeFragmentsOptions = removeFragmentsOptions != null
                ? removeFragmentsOptions
                : RemoveFragmentsOptions.create();
    }

    @Override
    public EventType getEventType() {
        return EventType.RemoveFragments;
    }

    public String[] getDataLines() {
        List<String> dataLines = new ArrayList<>();

        dataLines.add(getDataLine(SELECTOR_DATALINE_LITERAL, selector));

        addDataLineIfNotDefault(dataLines, SETTLE_DURATION_DATALINE_LITERAL,
                removeFragmentsOptions.getSettleDuration(), DEFAULT_FRAGMENTS_SETTLE_DURATION);

        if (removeFragmentsOptions.isUseViewTransition()) {
            dataLines.add(getDataLine(USE_VIEW_TRANSITION_DATALINE_LITERAL, getBooleanAsString(true)));
        }

        return dataLines.toArray(String[]::new);
    }
}
