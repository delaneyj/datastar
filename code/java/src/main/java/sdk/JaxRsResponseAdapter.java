package sdk;

import javax.ws.rs.core.Response;
import java.io.PrintWriter;
import java.io.StringWriter;

public class JaxRsResponseAdapter extends AbstractResponseAdapter {

    private final StringWriter stringWriter = new StringWriter();
    private Response.ResponseBuilder responseBuilder = Response.ok();

    public JaxRsResponseAdapter() {
        this.writer = new PrintWriter(stringWriter);
    }

    @Override
    public void setHeader(String name, String value) {
        responseBuilder = responseBuilder.header(name, value);
    }

    @Override
    public void setStatus(int status) {
        responseBuilder = Response.status(status);
    }

    public Response buildResponse() {
        return responseBuilder.entity(stringWriter.toString()).build();
    }
}
