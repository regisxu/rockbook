package regis.roadbook;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.util.Properties;

public class AppProperties {

    private static final Properties props = new Properties();

    static {
        try {
            init();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static void init() throws IOException {
        String base = System.getProperty("app.base.dir");
        if (base == null || base.trim().isEmpty()) {
            base = System.getenv("APP_BASE_DIR");
            if (base == null || base.trim().isEmpty()) {
                throw new RuntimeException("Please setup env APP_BASE_DIR!");
            }
        }
        base = base.trim();
        System.setProperty("app.base.dir", base);

        File file = new File(base, "app.properties");
        if (file.exists()) {
            try (Reader reader = new FileReader(file)) {
                props.load(reader);
            }
        } else {
            try (InputStream in = AppProperties.class.getClassLoader().getResourceAsStream("app.properties")) {
                props.load(in);
            }
        }
    }

    public static String get(String key) {
        return props.getProperty(key);
    }
}
