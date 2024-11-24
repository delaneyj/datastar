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
import sdk.events.executescript.ExecuteScript;
import sdk.events.executescript.ExecuteScriptOptions;

import java.util.UUID;

@WebServlet(name = "RedirectServlet", urlPatterns = "/redirect", asyncSupported = true)
public class RedirectServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            AsyncContext asyncContext = request.startAsync();
            asyncContext.setTimeout(0); // Disable timeout for long polling

            AbstractResponseAdapter responseAdapter = new HttpServletResponseAdapter(response);
            ServerSentEventGenerator sse = new ServerSentEventGenerator(responseAdapter);

            String script = "window.location = \"https://datastar.fly.dev\"";
            SSEOptions sseOptions = SSEOptions.create()
                    .withEventId(UUID.randomUUID().toString())
                    .withRetryDuration(5000);
            ExecuteScriptOptions executeScriptOptions = ExecuteScriptOptions.create();
            executeScriptOptions.withAutoRemove(true);
            executeScriptOptions.withAttributes("type module");
            ExecuteScript executeScript = new ExecuteScript(script, sseOptions, executeScriptOptions);
            sse.ExecuteScript(executeScript);

            asyncContext.complete();

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

}
