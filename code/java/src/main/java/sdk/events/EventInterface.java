package sdk.events;

import sdk.enums.EventType;
import java.util.Map;

public interface EventInterface {

    /**
     * Returns the event type for this event.
     *
     * @return The event type.
     */
    EventType getEventType();

    /**
     * Returns the options for this event.
     *
     * @return A map of options.
     */
    Map<String, Object> getOptions();

    /**
     * Returns the data lines for this event.
     *
     * @return A list of strings representing the data lines.
     */
    String[] getDataLines();

    /**
     * Converts a boolean to its string representation.
     *
     * @param value The boolean value.
     * @return "true" if true, otherwise "false".
     */
    String getBooleanAsString(boolean value);

    /**
     * Constructs a data line from the given key and value.
     *
     * @param key   The key for the data line.
     * @param value The value for the data line.
     * @return A formatted data line string.
     */
    String getDataLine(String key, String value);
}
