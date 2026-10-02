package es.rdm.Dimofy.config;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String APP_PACKAGE = "es.rdm.Dimofy";

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception ex, WebRequest request) {
        String path = request.getDescription(false).replace("uri=", "");
        Throwable root = rootCause(ex);
        StackTraceElement origin = applicationOrigin(root);

        String exceptionType = root.getClass().getSimpleName();
        String reason = root.getMessage() != null ? root.getMessage() : "Sin mensaje de excepción";
        String className = origin != null ? origin.getClassName() : "No localizada";
        String methodName = origin != null ? origin.getMethodName() : "No localizado";
        int line = origin != null ? origin.getLineNumber() : -1;

        log.error("ERROR APLICACION | path={} | excepcion={} | clase={} | metodo={} | linea={} | motivo={}",
                path, exceptionType, className, methodName, line, reason, ex);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Internal Server Error");
        body.put("exception", exceptionType);
        body.put("class", className);
        body.put("method", methodName);
        body.put("line", line);
        body.put("reason", reason);
        body.put("path", path);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private Throwable rootCause(Throwable throwable) {
        Throwable result = throwable;
        while (result.getCause() != null && result.getCause() != result) {
            result = result.getCause();
        }
        return result;
    }

    private StackTraceElement applicationOrigin(Throwable throwable) {
        for (StackTraceElement element : throwable.getStackTrace()) {
            if (element.getClassName().startsWith(APP_PACKAGE)) {
                return element;
            }
        }
        return throwable.getStackTrace().length > 0 ? throwable.getStackTrace()[0] : null;
    }
}
