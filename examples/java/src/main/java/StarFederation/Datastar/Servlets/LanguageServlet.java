package StarFederation.Datastar.Servlets;

import StarFederation.Datastar.ServerSentEventGenerator;
import StarFederation.Datastar.adapters.response.AbstractResponseAdapter;
import StarFederation.Datastar.adapters.response.HttpServletResponseAdapter;
import StarFederation.Datastar.enums.FragmentMergeMode;
import StarFederation.Datastar.events.MergeFragments;
import StarFederation.Datastar.events.MergeFragmentsOptions;
import jakarta.servlet.AsyncContext;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

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
            MergeFragmentsOptions mergeFragmentsOptions = MergeFragmentsOptions.create()
                    .withMergeMode(FragmentMergeMode.Morph)
                    .withSettleDuration(700);
            MergeFragments mergeFragments = new MergeFragments(fragment, mergeFragmentsOptions);
            mergeFragments.setEventId(UUID.randomUUID().toString());
            mergeFragments.setRetryDuration(1000);
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
