package StarFederation.Datastar.events;

import StarFederation.Datastar.enums.EventType;
import static StarFederation.Datastar.Consts.PATHS_DATALINE_LITERAL;

import java.util.ArrayList;
import java.util.List;

public class RemoveSignals extends AbstractSSEEvent {

    private final List<String> paths;

    public RemoveSignals(List<String> paths) {
        super();
        if (paths == null || paths.isEmpty()) {
            throw new IllegalArgumentException("Paths cannot be null or empty.");
        }
        this.paths = new ArrayList<>(paths);
    }

    @Override
    public EventType getEventType() {
        return EventType.RemoveSignals;
    }

    public String[] getDataLines() {
        List<String> dataLines = new ArrayList<>();

        String joinedPaths = String.join(" ", paths);
        dataLines.add(getDataLine(PATHS_DATALINE_LITERAL, joinedPaths));

        return dataLines.toArray(String[]::new);
    }
}
