package StarFederation.Datastar.Servlets;

import StarFederation.Datastar.ServerSentEventGenerator;
import StarFederation.Datastar.adapters.response.AbstractResponseAdapter;
import StarFederation.Datastar.adapters.response.HttpServletResponseAdapter;
import StarFederation.Datastar.events.MergeFragments;
import StarFederation.Datastar.events.MergeFragmentsOptions;
import jakarta.servlet.AsyncContext;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@WebServlet(name = "FeedServlet", urlPatterns = "/feed", asyncSupported = true)
public class FeedServlet extends HttpServlet {

    private static final Random RANDOM = new Random();
    private static final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            AsyncContext asyncContext = request.startAsync();
            asyncContext.setTimeout(0);

            AbstractResponseAdapter responseAdapter = new HttpServletResponseAdapter(response);
            ServerSentEventGenerator sse = new ServerSentEventGenerator(responseAdapter);

            final ScheduledFuture<?>[] task = new ScheduledFuture<?>[1];
            task[0] = scheduler.scheduleAtFixedRate(() -> {
                try {
                    HttpServletResponse asyncResponse = (HttpServletResponse) asyncContext.getResponse();
                    if (asyncResponse.getWriter().checkError()) {
                        cancelTaskAndComplete(task[0], asyncContext);
                        return;
                    }

                    String fragment = String.format("<span id='feed'>%d</span>", RANDOM.nextInt(100));
                    MergeFragmentsOptions mergeFragmentsOptions = MergeFragmentsOptions.create();
                    MergeFragments mergeFragments = new MergeFragments(fragment, mergeFragmentsOptions);
                    mergeFragments.setEventId(UUID.randomUUID().toString());
                    mergeFragments.setRetryDuration(1000);
                    sse.MergeFragments(mergeFragments);

                } catch (Exception e) {
                    e.printStackTrace();
                    cancelTaskAndComplete(task[0], asyncContext);
                }
            }, 0, 1, TimeUnit.SECONDS);

            asyncContext.addListener(new jakarta.servlet.AsyncListener() {
                @Override
                public void onComplete(jakarta.servlet.AsyncEvent event) {
                    task[0].cancel(true);
                }

                @Override
                public void onTimeout(jakarta.servlet.AsyncEvent event) {
                    task[0].cancel(true);
                }

                @Override
                public void onError(jakarta.servlet.AsyncEvent event) {
                    task[0].cancel(true);
                }

                @Override
                public void onStartAsync(jakarta.servlet.AsyncEvent event) {
                    // No action needed
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    private void cancelTaskAndComplete(ScheduledFuture<?> task, AsyncContext asyncContext) {
        if (task != null) {
            task.cancel(true);
        }
        asyncContext.complete();
    }
}
