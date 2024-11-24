package sdk.events;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.Map;

public class SignalReader {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Parses incoming data from the browser and unmarshals it into the given store object.
     *
     * @param request The incoming HTTP request from the browser.
     * @param store   A Map that will hold the parsed data.
     * @return True if parsing was successful, otherwise throws an exception.
     * @throws IOException If an error occurs during reading or parsing.
     */
    public static boolean readSignals(HttpServletRequest request, Map<String, Object> store) throws IOException {
        if (request == null || store == null) {
            throw new IllegalArgumentException("Request and store cannot be null.");
        }

        String data;

        if ("GET".equalsIgnoreCase(request.getMethod())) {
            // Handle GET requests by parsing the `datastar` query parameter
            data = request.getParameter("datastar");
            if (data == null || data.isBlank()) {
                throw new IllegalArgumentException("Missing 'datastar' query parameter in GET request.");
            }
        } else {
            // Handle other methods by reading the request body
            StringBuilder requestBody = new StringBuilder();
            try (BufferedReader reader = request.getReader()) {
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
            Map<String, Object> parsedData = objectMapper.readValue(data, Map.class);
            store.putAll(parsedData);
            return true;
        } catch (IOException e) {
            throw new IOException("Failed to parse JSON data.", e);
        }
    }
}
