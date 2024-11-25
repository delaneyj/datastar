package StarFederation.Datastar;

import StarFederation.Datastar.Servlets.*;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class Main {

    public static void main(String[] args) throws Exception {
        Server server = new Server(8080);

        ServletContextHandler servletContext = new ServletContextHandler(ServletContextHandler.SESSIONS);
        servletContext.setContextPath("/");

        configureRoutes(servletContext);

        ResourceHandler resourceHandler = new ResourceHandler();
        resourceHandler.setDirectoriesListed(false);
        resourceHandler.setResourceBase(Objects.requireNonNull(Main.class.getClassLoader().getResource(".")).toExternalForm());
        resourceHandler.setWelcomeFiles(new String[]{"index.html"});

        HandlerList handlers = new HandlerList();
        handlers.addHandler(resourceHandler);
        handlers.addHandler(servletContext);

        server.setHandler(handlers);

        server.start();
        System.out.println("Server started at http://localhost:8080");
        System.out.println("Available routes:");
        routes.keySet().forEach(route -> System.out.println(" - " + route));

        server.join();
    }

    private static final Map<String, Runnable> routes = new HashMap<>();

    private static void configureRoutes(ServletContextHandler context) {
        addRoute(context, "/language/*", () -> context.addServlet(new ServletHolder(new LanguageServlet()), "/language/*"));
        addRoute(context, "/get", () -> context.addServlet(new ServletHolder(new GetServlet()), "/get"));
        addRoute(context, "/patch", () -> context.addServlet(new ServletHolder(new PatchServlet()), "/patch"));
        addRoute(context, "/target", () -> context.addServlet(new ServletHolder(new TargetServlet()), "/target"));
        addRoute(context, "/feed", () -> context.addServlet(new ServletHolder(new FeedServlet()), "/feed"));
        addRoute(context, "/removeSignal", () -> context.addServlet(new ServletHolder(new RemoveSignalServlet()), "/removeSignal"));
        addRoute(context, "/removeNestedSignals", () -> context.addServlet(new ServletHolder(new RemoveNestedSignalsServlet()), "/removeNestedSignals"));
        addRoute(context, "/removeTarget", () -> context.addServlet(new ServletHolder(new RemoveTargetServlet()), "/removeTarget"));
        addRoute(context, "/redirect", () -> context.addServlet(new ServletHolder(new RedirectServlet()), "/redirect"));

        initializeRoutes();
    }

    private static void addRoute(ServletContextHandler context, String path, Runnable setup) {
        routes.put(path, setup);
    }

    private static void initializeRoutes() {
        routes.values().forEach(Runnable::run);
    }
}
