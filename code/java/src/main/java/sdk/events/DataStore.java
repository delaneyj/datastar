package sdk.events;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

public class DataStore {

    private final Map<String, Object> store = new HashMap<>();
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public void put(String key, Object value) {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("Key cannot be null or blank.");
        }
        store.put(key, value);
    }

    public <T> T get(String key, Class<T> type) {
        Object value = store.get(key);
        if (value == null) {
            return null;
        }
        if (!type.isInstance(value)) {
            throw new IllegalArgumentException("Value for key '" + key + "' is not of type " + type.getSimpleName());
        }
        return type.cast(value);
    }

    public Map<String, Object> getStore() {
        return store;
    }

    public void putAll(Map<String, Object> data) {
        if (data != null) {
            for (Map.Entry<String, Object> entry : data.entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();

                // Convert the value to a String, or skip the entry if not possible
                if (value != null) {
                    this.store.put(key, value.toString());
                }
            }
        }
    }

    public String toJson() {
        try {
            return objectMapper.writeValueAsString(store);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize store to JSON.", e);
        }
    }

    public void fromJson(String json) {
        try {
            Map<String, Object> data = objectMapper.readValue(json, Map.class);
            store.clear();
            store.putAll(data);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid JSON format.", e);
        }
    }

    @Override
    public String toString() {
        return "DataStore{" +
                "store=" + store +
                '}';
    }
}
