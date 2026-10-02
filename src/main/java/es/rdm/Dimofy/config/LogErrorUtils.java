package es.rdm.Dimofy.config;

import org.slf4j.Logger;

public final class LogErrorUtils {

    private static final String APP_PACKAGE = "es.rdm.Dimofy";

    private LogErrorUtils() {}

    public static void error(Logger log, String contexto, Throwable ex) {
        Throwable root = rootCause(ex);
        StackTraceElement origin = applicationOrigin(root);
        String clase = origin != null ? origin.getClassName() : "No localizada";
        String metodo = origin != null ? origin.getMethodName() : "No localizado";
        int linea = origin != null ? origin.getLineNumber() : -1;
        String motivo = root.getMessage() != null ? root.getMessage() : "Sin mensaje de excepción";

        log.error("ERROR APLICACION | contexto={} | excepcion={} | clase={} | metodo={} | linea={} | motivo={}",
                contexto, root.getClass().getSimpleName(), clase, metodo, linea, motivo, ex);
    }

    private static Throwable rootCause(Throwable throwable) {
        Throwable result = throwable;
        while (result.getCause() != null && result.getCause() != result) result = result.getCause();
        return result;
    }

    private static StackTraceElement applicationOrigin(Throwable throwable) {
        for (StackTraceElement element : throwable.getStackTrace()) {
            if (element.getClassName().startsWith(APP_PACKAGE)) return element;
        }
        return throwable.getStackTrace().length > 0 ? throwable.getStackTrace()[0] : null;
    }
}
