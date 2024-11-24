package com.example.demo;

import jakarta.servlet.AsyncContext;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sdk.AbstractResponseAdapter;
import sdk.HttpServletResponseAdapter;
import sdk.ServerSentEventGenerator;
import sdk.events.DataStore;
import sdk.events.SSEOptions;
import sdk.events.SignalReader;
import sdk.events.mergesignals.MergeSignals;
import sdk.events.mergesignals.MergeSignalsOptions;
import java.util.UUID;

@WebServlet(name = "PatchServlet", urlPatterns = "/patch", asyncSupported = true)
public class PatchServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            AsyncContext asyncContext = request.startAsync();
            asyncContext.setTimeout(0);

            DataStore store = new DataStore();
            SignalReader.readSignals(request, store.getStore());
            String input = store.get("input", String.class);
            if (input == null || input.isBlank()) {
                asyncContext.complete();
            }
            String patchedOutput = "Patched Output: " + input;
            store.put("output", patchedOutput);

            AbstractResponseAdapter responseAdapter = new HttpServletResponseAdapter(response);
            ServerSentEventGenerator sse = new ServerSentEventGenerator(responseAdapter);

            SSEOptions sseOptions = SSEOptions.create()
                    .withEventId(UUID.randomUUID().toString());
            MergeSignalsOptions mergeSignalsOptions = MergeSignalsOptions.create();

            MergeSignals mergeSignals = new MergeSignals(store.toJson(), sseOptions, mergeSignalsOptions);
            sse.MergeSignals(mergeSignals);

            asyncContext.complete();

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
