package StarFederation.Datastar.Servlets;

import StarFederation.Datastar.ServerSentEventGenerator;
import StarFederation.Datastar.adapters.response.AbstractResponseAdapter;
import StarFederation.Datastar.adapters.response.HttpServletResponseAdapter;
import StarFederation.Datastar.enums.FragmentMergeMode;
import StarFederation.Datastar.events.DataStore;
import StarFederation.Datastar.events.MergeFragments;
import StarFederation.Datastar.events.MergeFragmentsOptions;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@WebServlet(name = "GetServlet", urlPatterns = "/get", asyncSupported = true)
public class GetServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            AbstractResponseAdapter responseAdapter = new HttpServletResponseAdapter(response);
            ServerSentEventGenerator sse = new ServerSentEventGenerator(responseAdapter);

            DataStore newDataStore = new DataStore();
            Map<String, Object> user = new HashMap<>();
            user.put("name", "John Doe");
            user.put("email", "test@test.com");
            newDataStore.put("user", user);

            String jsonData = newDataStore.toJson();
            String fragment = String.format(
                    "<main id='main' data-store='%s' class='mx-auto'>",
                    jsonData
            );
            MergeFragmentsOptions mergeFragmentsOptions = MergeFragmentsOptions.create()
                    .withMergeMode(FragmentMergeMode.UpsertAttributes);
            MergeFragments mergeFragments = new MergeFragments(fragment, mergeFragmentsOptions);
            mergeFragments.setEventId(UUID.randomUUID().toString());

            sse.MergeFragments(mergeFragments);

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
