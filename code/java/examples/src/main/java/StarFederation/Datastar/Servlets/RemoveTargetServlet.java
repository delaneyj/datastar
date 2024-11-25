package StarFederation.Datastar.Servlets;

import StarFederation.Datastar.ServerSentEventGenerator;
import StarFederation.Datastar.adapters.AbstractResponseAdapter;
import StarFederation.Datastar.adapters.HttpServletResponseAdapter;
import StarFederation.Datastar.events.RemoveFragments;
import StarFederation.Datastar.events.RemoveFragmentsOptions;
import jakarta.servlet.AsyncContext;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

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
            RemoveFragmentsOptions removeFragmentsOptions = RemoveFragmentsOptions.create();
            removeFragmentsOptions.withSettleDuration(20);
            RemoveFragments removeFragments = new RemoveFragments(selector, removeFragmentsOptions);
            removeFragments.setEventId(UUID.randomUUID().toString());
            sse.RemoveFragments(removeFragments);

            asyncContext.complete();

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

}
