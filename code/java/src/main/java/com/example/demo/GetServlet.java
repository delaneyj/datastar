package com.example.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sdk.AbstractResponseAdapter;
import sdk.HttpServletResponseAdapter;
import sdk.ServerSentEventGenerator;
import sdk.enums.FragmentMergeMode;
import sdk.events.DataStore;
import sdk.events.SSEOptions;
import sdk.events.SignalReader;
import sdk.events.mergefragments.MergeFragments;
import sdk.events.mergefragments.MergeFragmentsOptions;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@WebServlet(name = "GetServlet", urlPatterns = "/get", asyncSupported = true)
public class GetServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            AbstractResponseAdapter responseAdapter = new HttpServletResponseAdapter(response);
            ServerSentEventGenerator sse = new ServerSentEventGenerator(responseAdapter);

            DataStore newDataStore = new DataStore();
            Map<String, Object> user = new HashMap<>();
            user.put("name", "John Doe");
            user.put("email", "test@test.com");
            newDataStore.put("user", user);

            String jsonData = newDataStore.toJson();
            String fragment = String.format(
                    "<main class='container' id='main' data-store='%s'></main>",
                    jsonData
            );

            SSEOptions sseOptions = SSEOptions.create()
                    .withEventId(UUID.randomUUID().toString());
            MergeFragmentsOptions mergeFragmentsOptions = MergeFragmentsOptions.create()
                    .withMergeMode(FragmentMergeMode.UPSERT_ATTRIBUTES);
            MergeFragments mergeFragments = new MergeFragments(fragment, sseOptions, mergeFragmentsOptions);

            sse.MergeFragments(mergeFragments);

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
