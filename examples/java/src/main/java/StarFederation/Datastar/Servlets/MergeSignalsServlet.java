package StarFederation.Datastar.Servlets;

import StarFederation.Datastar.ServerSentEventGenerator;
import StarFederation.Datastar.adapters.request.HttpServletRequestAdapter;
import StarFederation.Datastar.adapters.request.RequestAdapter;
import StarFederation.Datastar.adapters.response.AbstractResponseAdapter;
import StarFederation.Datastar.adapters.response.HttpServletResponseAdapter;
import StarFederation.Datastar.events.DataStore;
import StarFederation.Datastar.events.MergeSignals;
import StarFederation.Datastar.events.MergeSignalsOptions;
import StarFederation.Datastar.events.SignalReader;
import jakarta.servlet.AsyncContext;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.UUID;

@WebServlet(name = "PatchServlet", urlPatterns = "/patch", asyncSupported = true)
public class MergeSignalsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            AsyncContext asyncContext = request.startAsync();
            asyncContext.setTimeout(0);

            RequestAdapter adapter = new HttpServletRequestAdapter(request);

            DataStore store = new DataStore();
            SignalReader.readSignals(adapter, store.getStore());

            String input = store.get("input", String.class);
            if (input == null || input.isBlank()) {
                asyncContext.complete();
            }
            store.put("output", input);

            AbstractResponseAdapter responseAdapter = new HttpServletResponseAdapter(response);
            ServerSentEventGenerator sse = new ServerSentEventGenerator(responseAdapter);
            MergeSignalsOptions mergeSignalsOptions = MergeSignalsOptions.create();
            MergeSignals mergeSignals = new MergeSignals(store.toJson(), mergeSignalsOptions);
            mergeSignals.setEventId(UUID.randomUUID().toString());
            mergeSignals.setRetryDuration(1000);

            sse.MergeSignals(mergeSignals);

            asyncContext.complete();

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
