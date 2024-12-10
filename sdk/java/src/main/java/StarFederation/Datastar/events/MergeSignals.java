package StarFederation.Datastar.events;

import StarFederation.Datastar.enums.EventType;
import static StarFederation.Datastar.Consts.ONLY_IF_MISSING_DATALINE_LITERAL;
import static StarFederation.Datastar.Consts.SIGNALS_DATALINE_LITERAL;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MergeSignals extends AbstractSSEEvent {

    private final String data;
    private final MergeSignalsOptions mergeSignalsOptions;

    public MergeSignals(String data, MergeSignalsOptions mergeSignalsOptions) {
        super();
        if (data == null || data.isBlank()) {
            throw new IllegalArgumentException("Data cannot be null or empty.");
        }
        this.data = data.trim();
        this.mergeSignalsOptions = mergeSignalsOptions != null
                ? mergeSignalsOptions
                : MergeSignalsOptions.create();
    }

    @Override
    public EventType getEventType() {
        return EventType.MergeSignals;
    }

    public String[] getDataLines() {
        List<String> dataLines = new ArrayList<>();

        if (mergeSignalsOptions.isOnlyIfMissing()) {
            dataLines.add(getDataLine(ONLY_IF_MISSING_DATALINE_LITERAL, getBooleanAsString(true)));
        }

        Arrays.stream(data.split("\n"))
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .forEach(line -> dataLines.add(getDataLine(SIGNALS_DATALINE_LITERAL, line)));

        return dataLines.toArray(String[]::new);
    }
}
