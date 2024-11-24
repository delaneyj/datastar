package com.example.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sdk.AbstractResponseAdapter;
import sdk.HttpServletResponseAdapter;
import sdk.ServerSentEventGenerator;
import sdk.events.removesignals.RemoveSignals;
import sdk.events.SSEOptions;

import java.util.List;
import java.util.UUID;

@WebServlet(name = "RemoveSignalServlet", urlPatterns = "/removeSignal", asyncSupported = true)
public class RemoveSignalServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            AbstractResponseAdapter responseAdapter = new HttpServletResponseAdapter(response);
            ServerSentEventGenerator sse = new ServerSentEventGenerator(responseAdapter);

            List<String> paths = List.of("user");
            SSEOptions sseOptions = SSEOptions.create()
                    .withEventId(UUID.randomUUID().toString())
                    .withRetryDuration(1500);

            RemoveSignals removeSignals = new RemoveSignals(paths, sseOptions);
            sse.RemoveSignals(removeSignals);

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}

