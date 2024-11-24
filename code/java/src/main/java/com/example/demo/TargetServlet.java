package com.example.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sdk.AbstractResponseAdapter;
import sdk.HttpServletResponseAdapter;
import sdk.ServerSentEventGenerator;
import sdk.events.SSEOptions;
import sdk.events.mergefragments.MergeFragments;
import sdk.events.mergefragments.MergeFragmentsOptions;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@WebServlet(name = "TargetServlet", urlPatterns = "/target", asyncSupported = true)
public class TargetServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            AbstractResponseAdapter responseAdapter = new HttpServletResponseAdapter(response);
            ServerSentEventGenerator sse = new ServerSentEventGenerator(responseAdapter);

            String today = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yy-MM-dd HH:mm:ss"));
            String fragment = String.format(
                    "<button id='target' class=\"w-full p-3 bg-purple-700 text-white font-semibold rounded hover:opacity-80 transition\" data-on-click=\"$get('/removeTarget')\">Remove %s</button>",
                    today
            );

            SSEOptions sseOptions = SSEOptions.create();
            MergeFragmentsOptions options = MergeFragmentsOptions.create()
                    .withSettleDuration(10000);
            MergeFragments mergeFragments = new MergeFragments(fragment, sseOptions, options);
            sse.MergeFragments(mergeFragments);

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}

