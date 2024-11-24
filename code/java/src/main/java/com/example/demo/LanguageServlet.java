package com.example.demo;

import jakarta.servlet.AsyncContext;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sdk.AbstractResponseAdapter;
import sdk.HttpServletResponseAdapter;
import sdk.events.SSEOptions;
import sdk.ServerSentEventGenerator;
import sdk.enums.FragmentMergeMode;
import sdk.events.mergefragments.MergeFragments;
import sdk.events.mergefragments.MergeFragmentsOptions;
import java.util.UUID;

@WebServlet(name = "LanguageServlet", urlPatterns = "/language/*", asyncSupported = true)
public class LanguageServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            String lang = getLangFromRequest(request);
            if (lang == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("Missing or invalid language parameter.");
                return;
            }

            AsyncContext asyncContext = request.startAsync();
            asyncContext.setTimeout(0);

            AbstractResponseAdapter responseAdapter = new HttpServletResponseAdapter(response);
            ServerSentEventGenerator sse = new ServerSentEventGenerator(responseAdapter);

            String fragment = String.format("<span id='language'>%s</span>", lang);
            SSEOptions sseOptions = SSEOptions.create()
                    .withEventId(UUID.randomUUID().toString());
            MergeFragmentsOptions mergeFragmentsOptions = MergeFragmentsOptions.create()
                    .withMergeMode(FragmentMergeMode.MORPH)
                    .withSettleDuration(700);
            MergeFragments mergeFragments = new MergeFragments(fragment, sseOptions, mergeFragmentsOptions);
            sse.MergeFragments(mergeFragments);

            asyncContext.complete();

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    private String getLangFromRequest(HttpServletRequest request) {
        // Extract the language parameter from the URL path
        String pathInfo = request.getPathInfo();
        if (pathInfo == null || pathInfo.isBlank()) {
            return null;
        }
        String[] parts = pathInfo.split("/");
        return parts.length > 1 ? parts[1] : null;
    }
}
