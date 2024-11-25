//package com.example.demo.unit;
//
//import jakarta.servlet.http.HttpServletRequest;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import sdk.events.DataStore;
//import sdk.events.SignalReader;
//
//import java.io.BufferedReader;
//import java.io.IOException;
//import java.io.StringReader;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//class SignalReaderTest {
//
//    private HttpServletRequest request;
//
//    @BeforeEach
//    void setUp() {
//        request = mock(HttpServletRequest.class);
//    }
//
//    @Test
//    void testReadSignalsFromGetRequest() throws Exception {
//        // Mock GET request
//        when(request.getMethod()).thenReturn("GET");
//        when(request.getParameter("datastar")).thenReturn("{\"key\":\"value\"}");
//
//        // Create DataStore to hold parsed data
//        DataStore store = new DataStore();
//
//        // Test
//        boolean result = SignalReader.readSignals(request, store.getStore());
//
//        // Assert
//        assertTrue(result);
//        assertEquals(1, store.getStore().size());
//        assertEquals("value", store.get("key", String.class));
//    }
//
//    @Test
//    void testReadSignalsFromPostRequest() throws Exception {
//        // Mock POST request with JSON body
//        when(request.getMethod()).thenReturn("POST");
//        when(request.getReader()).thenReturn(new BufferedReader(new StringReader("{\"key\":\"value\"}")));
//
//        // Create DataStore to hold parsed data
//        DataStore store = new DataStore();
//
//        // Test
//        boolean result = SignalReader.readSignals(request, store.getStore());
//
//        // Assert
//        assertTrue(result);
//        assertEquals(1, store.getStore().size());
//        assertEquals("value", store.get("key", String.class));
//    }
//
//    @Test
//    void testReadSignalsFromEmptyGetRequest() {
//        // Mock GET request with missing 'datastar' parameter
//        when(request.getMethod()).thenReturn("GET");
//        when(request.getParameter("datastar")).thenReturn(null);
//
//        // Create DataStore to hold parsed data
//        DataStore store = new DataStore();
//
//        // Test & Assert
//        assertThrows(IllegalArgumentException.class, () -> SignalReader.readSignals(request, store.getStore()));
//    }
//
//    @Test
//    void testReadSignalsFromEmptyPostRequest() throws IOException {
//        // Mock POST request with empty body
//        when(request.getMethod()).thenReturn("POST");
//        when(request.getReader()).thenReturn(new BufferedReader(new StringReader("")));
//
//        // Create DataStore to hold parsed data
//        DataStore store = new DataStore();
//
//        // Test & Assert
//        assertThrows(IllegalArgumentException.class, () -> SignalReader.readSignals(request, store.getStore()));
//    }
//
//    @Test
//    void testReadSignalsWithInvalidJson() throws Exception {
//        // Mock POST request with invalid JSON
//        when(request.getMethod()).thenReturn("POST");
//        when(request.getReader()).thenReturn(new BufferedReader(new StringReader("{key: value}"))); // Invalid JSON
//
//        // Create DataStore to hold parsed data
//        DataStore store = new DataStore();
//
//        // Test & Assert
//        assertThrows(IOException.class, () -> SignalReader.readSignals(request, store.getStore()));
//    }
//
//    @Test
//    void testReadSignalsWithNullRequest() {
//        // Create DataStore to hold parsed data
//        DataStore store = new DataStore();
//
//        // Test & Assert
//        assertThrows(IllegalArgumentException.class, () -> SignalReader.readSignals(null, store.getStore()));
//    }
//
//    @Test
//    void testReadSignalsWithNullStore() {
//        // Test & Assert
//        assertThrows(IllegalArgumentException.class, () -> SignalReader.readSignals(request, null));
//    }
//}
