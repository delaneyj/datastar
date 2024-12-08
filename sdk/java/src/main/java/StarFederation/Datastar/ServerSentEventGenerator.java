package StarFederation.Datastar;

import StarFederation.Datastar.adapters.response.AbstractResponseAdapter;
import StarFederation.Datastar.enums.EventType;
import StarFederation.Datastar.events.*;

import java.io.PrintWriter;
import java.util.Map;

public class ServerSentEventGenerator {

    private final PrintWriter writer;

    public ServerSentEventGenerator(AbstractResponseAdapter response) {
        if (response == null) {
            throw new IllegalArgumentException("Response adapter cannot be null.");
        }

        try {
            response.setContentType("text/event-stream");
            response.setCharacterEncoding("UTF-8");
            response.setHeader("Cache-Control", "no-cache");
            response.setHeader("Connection", "keep-alive");

            this.writer = response.getWriter();
            this.writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize ServerSentEventGenerator.", e);
        }
    }

    public synchronized void MergeFragments(MergeFragments mergeFragments) {
        send(mergeFragments.getEventType(), mergeFragments.getDataLines(), mergeFragments.getOptions());
    }

    public synchronized void RemoveFragments(RemoveFragments removeFragments) {
        send(removeFragments.getEventType(), removeFragments.getDataLines(), removeFragments.getOptions());
    }

    public synchronized void MergeSignals(MergeSignals mergeSignals) {
        send(mergeSignals.getEventType(), mergeSignals.getDataLines(), mergeSignals.getOptions());
    }

    public synchronized void RemoveSignals(RemoveSignals removeSignals) {
        send(removeSignals.getEventType(), removeSignals.getDataLines(), removeSignals.getOptions());
    }

    public synchronized void ExecuteScript(ExecuteScript executeScript) {
        send(executeScript.getEventType(), executeScript.getDataLines(), executeScript.getOptions());
    }

    private synchronized void send(EventType eventType, String[] dataLines, Map<String, Object> options) {
        StringBuilder output = new StringBuilder();

        output.append("event: ").append(eventType.getValue()).append("\n");

        for (Map.Entry<String, Object> entry : options.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            output.append(key).append(": ").append(value).append("\n");
        }

        for (String line : dataLines) {
            output.append(line).append("\n");
        }

        output.append("\n");

        writer.print(output);
        writer.flush();
    }

    public synchronized void close() {
        writer.close();
    }
}


