package StarFederation.Datastar.Servlets;

import StarFederation.Datastar.ServerSentEventGenerator;
import StarFederation.Datastar.adapters.AbstractResponseAdapter;
import StarFederation.Datastar.adapters.HttpServletResponseAdapter;
import StarFederation.Datastar.events.ExecuteScript;
import StarFederation.Datastar.events.ExecuteScriptOptions;
import jakarta.servlet.AsyncContext;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

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
            ExecuteScriptOptions executeScriptOptions = ExecuteScriptOptions.create()
                    .withAutoRemove(true)
                    .withAttributes("type module");
            ExecuteScript executeScript = new ExecuteScript(script, executeScriptOptions);
            executeScript.setEventId(UUID.randomUUID().toString());
            executeScript.setRetryDuration(1000);
            sse.ExecuteScript(executeScript);

            asyncContext.complete();

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

}
