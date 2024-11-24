package sdk;

import org.springframework.http.ResponseEntity;

import java.io.PrintWriter;
import java.io.StringWriter;

public class ResponseEntityAdapter extends AbstractResponseAdapter {

    private final StringWriter stringWriter = new StringWriter();
    private ResponseEntity.BodyBuilder responseEntity = ResponseEntity.ok();

    public ResponseEntityAdapter() {
        this.writer = new PrintWriter(stringWriter);
    }

    @Override
    public void setHeader(String name, String value) {
        responseEntity = responseEntity.header(name, value);
    }

    @Override
    public void setStatus(int status) {
        responseEntity = ResponseEntity.status(status);
    }

    public ResponseEntity<String> buildResponse() {
        return responseEntity.body(stringWriter.toString());
    }
}
