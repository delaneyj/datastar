package StarFederation.Datastar.adapters.request;

import jakarta.servlet.http.HttpServletRequest;

import java.io.BufferedReader;
import java.io.IOException;

public class HttpServletRequestAdapter extends AbstractRequestAdapter {

    private final HttpServletRequest request;

    public HttpServletRequestAdapter(HttpServletRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("HttpServletRequest cannot be null.");
        }
        this.request = request;
    }

    @Override
    public String getMethod() {
        return request.getMethod();
    }

    @Override
    public String getParameter(String name) {
        return request.getParameter(name);
    }

    @Override
    public BufferedReader getReader() throws IOException {
        return request.getReader();
    }
}
