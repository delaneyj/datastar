package StarFederation.Datastar.events;

import StarFederation.Datastar.adapters.request.RequestAdapter;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.Map;

public class SignalReader {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Parses incoming data from the browser and unmarshals it into the given store object.
     *
     * @param requestAdapter The request adapter wrapping the incoming request.
     * @param store          A Map that will hold the parsed data.
     * @throws IOException If an error occurs during reading or parsing.
     */
    public static void readSignals(RequestAdapter requestAdapter, Map<String, Object> store) throws IOException {
        if (requestAdapter == null || store == null) {
            throw new IllegalArgumentException("RequestAdapter and store cannot be null.");
        }

        String data;

        if ("GET".equalsIgnoreCase(requestAdapter.getMethod())) {
            // Handle GET requests by parsing the `datastar` query parameter
            data = requestAdapter.getParameter("datastar");
            if (data == null || data.isBlank()) {
                throw new IllegalArgumentException("Missing 'datastar' query parameter in GET request.");
            }
        } else {
            // Handle other methods by reading the request body
            StringBuilder requestBody = new StringBuilder();
            try (BufferedReader reader = requestAdapter.getReader()) {
                String line;
                while ((line = reader.readLine()) != null) {
                    requestBody.append(line);
                }
            }

            data = requestBody.toString();
            if (data.isBlank()) {
                throw new IllegalArgumentException("Request body cannot be empty.");
            }
        }

        // Parse the JSON data into the store
        try {
            Map<String, Object> parsedData = objectMapper.readValue(data, new TypeReference<Map<String, Object>>() {});
            store.putAll(parsedData);
        } catch (IOException e) {
            throw new IOException("Failed to parse JSON data.", e);
        }
    }
}
