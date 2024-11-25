package StarFederation.Datastar.Servlets;

import StarFederation.Datastar.ServerSentEventGenerator;
import StarFederation.Datastar.adapters.AbstractResponseAdapter;
import StarFederation.Datastar.adapters.HttpServletResponseAdapter;
import StarFederation.Datastar.events.MergeFragments;
import StarFederation.Datastar.events.MergeFragmentsOptions;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

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
            MergeFragmentsOptions options = MergeFragmentsOptions.create()
                    .withSettleDuration(10000);
            MergeFragments mergeFragments = new MergeFragments(fragment, options);
            mergeFragments.setEventId(UUID.randomUUID().toString());
            sse.MergeFragments(mergeFragments);

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}

