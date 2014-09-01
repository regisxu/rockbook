package rocks.guidebook;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.Base64;

import org.bson.types.ObjectId;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;

public class Utils {

    public static String readString(Reader reader) throws IOException {
        BufferedReader r = null;
        if (reader instanceof BufferedReader) {
            r = (BufferedReader) reader;
        } else {
            r = new BufferedReader(reader);
        }
        String line = null;
        StringBuilder builder = new StringBuilder();
        while ((line = r.readLine()) != null) {
            builder.append(line + "\n");
        }
        return builder.toString();
    }

    public static String readString(InputStream in) throws IOException {
        BufferedReader r = new BufferedReader(new InputStreamReader(in));
        String line = null;
        StringBuilder builder = new StringBuilder();
        while ((line = r.readLine()) != null) {
            builder.append(line + "\n");
        }
        return builder.toString();
    }

    public static BasicDBObject json(BasicDBObject dbo) {
        if (dbo == null) {
            return null;
        }
        convertAllOid(dbo);
        return dbo;
    }

    private static void convertAllOid(BasicDBObject obj) {
        obj.entrySet().stream().forEach(entry -> {
            if (entry.getValue() instanceof ObjectId) {
                ObjectId oid = (ObjectId) entry.getValue();
                entry.setValue(id(oid));    
            } else if (entry.getValue() instanceof BasicDBList) {
                convertAllOid((BasicDBList) entry.getValue());
            } else if (entry.getValue() instanceof BasicDBObject) {
                convertAllOid((BasicDBObject) entry.getValue());
            }
        });

        Object value = obj.remove("_id");
        if (value != null) {
            obj.put("id", value);
        }
    }

    private static void convertAllOid(BasicDBList obj) {
        for (int i = 0; i < obj.size(); ++i) {
            if (obj.get(i) instanceof ObjectId) {
                obj.set(i, id((ObjectId) obj.get(i)));
            } else if (obj.get(i) instanceof BasicDBList) {
                convertAllOid((BasicDBList) obj.get(i));
            } else if (obj.get(i) instanceof BasicDBObject) {
                convertAllOid((BasicDBObject) obj.get(i));
            }
        }
    }

    public static BasicDBObject dbo(BasicDBObject json) {
        if (json == null) {
            return null;
        }
        convertAllId(json);
        return json;
    }

    private static void convertAllId(BasicDBObject json) {
        json.entrySet().forEach(entry -> {
            if (isId(entry.getKey(), entry.getValue())) {
                entry.setValue(oid((String) entry.getValue()));    
            } else if (entry.getValue() instanceof BasicDBObject) {
                convertAllId((BasicDBObject) entry.getValue());
            } else if (entry.getValue() instanceof BasicDBList) {
                convertAllId((BasicDBList) entry.getValue());
            }
        });
        Object id = json.remove("id");
        if (id != null) {
            json.put("_id", id);
        }
    }

    private static void convertAllId(BasicDBList json) {
        for (int i = 0; i < json.size(); ++i) {
            if (isId("id", json.get(i))) {
                json.set(i, oid((String) json.get(i)));    
            } else if (json.get(i) instanceof BasicDBList) {
                convertAllId((BasicDBList) json.get(i));
            } else if (json.get(i) instanceof BasicDBObject) {
                convertAllId((BasicDBObject) json.get(i));
            }
        }
    }

    private static boolean isId(String key, Object value) {
        return value instanceof String && key.endsWith("id") && ((String) value).length() == 16;
    }

    public static ObjectId oid(String id) {
        if (id == null) {
            return null;
        }
        return new ObjectId(Base64.getUrlDecoder().decode(id));
    }

    public static String id(ObjectId oid) {
        if (oid == null) {
            return null;
        }
        return Base64.getUrlEncoder().encodeToString(oid.toByteArray());
    }

    public static void main(String[] args) {
        System.out.println(id(oid(id(new ObjectId("530d7daa93b22bf6689478b8")))));
        System.out.println(oid(id(new ObjectId("530d7daa93b22bf6689478b8"))));
        System.out.println(id(new ObjectId("530d7daa93b22bf6689478b8")));
        System.out.println(id(new ObjectId("52f5915c843ac3a67d2a7aef")));
    }
}
