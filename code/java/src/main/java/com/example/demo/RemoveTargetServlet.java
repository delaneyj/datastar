package com.example.demo;

import jakarta.servlet.AsyncContext;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sdk.AbstractResponseAdapter;
import sdk.HttpServletResponseAdapter;
import sdk.ServerSentEventGenerator;
import sdk.events.SSEOptions;
import sdk.events.removefragments.RemoveFragments;
import sdk.events.removefragments.RemoveFragmentsOptions;

import java.util.UUID;

@WebServlet(name = "RemoveTargetServlet", urlPatterns = "/removeTarget", asyncSupported = true)
public class RemoveTargetServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            AsyncContext asyncContext = request.startAsync();
            asyncContext.setTimeout(0);

            AbstractResponseAdapter responseAdapter = new HttpServletResponseAdapter(response);
            ServerSentEventGenerator sse = new ServerSentEventGenerator(responseAdapter);

            String selector = "#target";
            SSEOptions sseOptions = SSEOptions.create();
            sseOptions.withEventId(UUID.randomUUID().toString());
            RemoveFragmentsOptions removeFragmentsOptions = RemoveFragmentsOptions.create();
            removeFragmentsOptions.withSettleDuration(20);
            RemoveFragments removeFragments = new RemoveFragments(selector, sseOptions, removeFragmentsOptions);

            sse.RemoveFragments(removeFragments);

            asyncContext.complete();

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

}
