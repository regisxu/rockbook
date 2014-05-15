package regis.roadbook;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.BitSet;
import java.util.HashMap;
import java.util.Map;

import org.bson.types.ObjectId;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;

public class Utils {

    private static char[] itoc = new char[64];

    private static Map<Character, Integer> ctoi = new HashMap<>();

    static {
        init();
    }

    private static void init() {
        int i = 0;
        for (; i < 10; ++i) {
            itoc[i] = (char) ('0' + i);
        }

        for (char j = 'a'; j <= 'z'; ++j, ++i) {
            itoc[i] = j;
        }

        for (char j = 'A'; j <= 'Z'; ++j, ++i) {
            itoc[i] = j;
        }

        itoc[i++] = '-';
        itoc[i++] = '_';

        for (int j = 0; j < itoc.length; ++j) {
            ctoi.put(itoc[j], j);
        }
    }

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
        BitSet bits = new BitSet(96);
        byte[] bs = new byte[12];

        for (int i = 0; i < id.length(); ++i) {
            int v = ctoi.get((char) id.charAt(i));
            for (int j = i * 6; j < 96; ++j) {
                if ((v & 32) == 32) {
                    bits.set(j);
                    setBit(bs, j, ((v & 32) == 32) ? 1 : 0);
                }
                v <<= 1;
            }
        }
        return new ObjectId(bits.toByteArray());
    }

    public static String id(ObjectId oid) {
        if (oid == null) {
            return null;
        }
        StringBuilder id = new StringBuilder();
        byte[] bs = oid.toByteArray();

        for (int i = 0; i < bs.length * 8;) {
            int v = 0;
            for (int j = 0; j < 6; ++j, ++i) {
                v = (v << 1) | getBit(bs, i);
            }
            id.append(itoc[v]);
        }
        return id.toString();
    }

    private static int getBit(byte[] bs, int i) {
        if (i >= bs.length * 8) {
            throw new IndexOutOfBoundsException("index " + i + " out of length " + (bs.length * 8));
        }
        return (bs[i / 8] >> (i % 8)) & 1;
    }

    private static void setBit(byte[] bs, int i, int v) {
        if (i >= bs.length * 8) {
            throw new IndexOutOfBoundsException("index " + i + " out of length " + (bs.length * 8));
        }
        if (v == 0) {
            bs[i / 8] = (byte) ((bs[i / 8]) & (v >> (i % 8)));
        } else if (v == 1) {
            bs[i / 8] = (byte) ((bs[i / 8]) | (v >> (i % 8)));
        }
    }

    public static void main(String[] args) {
        System.out.println(id(oid(id(new ObjectId("530d7daa93b22bf6689478b8")))));
        System.out.println();
    }
}
