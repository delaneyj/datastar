package StarFederation.Datastar.Servlets;

import StarFederation.Datastar.ServerSentEventGenerator;
import StarFederation.Datastar.adapters.response.AbstractResponseAdapter;
import StarFederation.Datastar.adapters.response.HttpServletResponseAdapter;
import StarFederation.Datastar.events.RemoveSignals;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;
import java.util.UUID;

@WebServlet(name = "RemoveSignalsServlet", urlPatterns = "/removeSignals", asyncSupported = true)
public class RemoveSignalsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            AbstractResponseAdapter responseAdapter = new HttpServletResponseAdapter(response);
            ServerSentEventGenerator sse = new ServerSentEventGenerator(responseAdapter);

            List<String> paths = List.of("user");
            RemoveSignals removeSignals = new RemoveSignals(paths);
            removeSignals.setEventId(UUID.randomUUID().toString());
            sse.RemoveSignals(removeSignals);

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}

