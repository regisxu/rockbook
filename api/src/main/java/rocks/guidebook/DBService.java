package rocks.guidebook;

import java.net.UnknownHostException;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCursor;
import com.mongodb.MongoClient;
import com.mongodb.WriteResult;

public class DBService {
    private DB db;
    private HistoryService history;

    private static DBService instance;

    public static synchronized DBService getInstance() throws UnknownHostException {
        if (instance == null) {
            instance = new DBService();
        }
        return instance;
    }

    private DBService() throws UnknownHostException {
        MongoClient client = new MongoClient(AppProperties.get("db.host"), Integer.parseInt(AppProperties
                .get("db.port")));
        db = client.getDB(AppProperties.get("db.name"));
        history = new HistoryService(db);
    }

    public BasicDBObject insert(String col, BasicDBObject obj) {
        WriteResult result = db.getCollection(col).insert(obj);
        if (result.getError() == null) {
            history.addHistory(col, obj);
            return obj;
        }
        return null;
    }

    public BasicDBObject update(String col, BasicDBObject obj) {
        BasicDBObject query = new BasicDBObject("_id", obj.remove("_id"));
        WriteResult result = db.getCollection(col).update(query, new BasicDBObject("$set", obj));
        if (result.getError() == null) {
            obj.append("_id", query.get("_id"));
            history.addHistory(col, obj);
            return obj;
        }
        return null;
    }

    public BasicDBObject delete(String col, BasicDBObject obj) {
        BasicDBObject ido = new BasicDBObject("_id", obj.getObjectId("_id"));
        WriteResult result = db.getCollection(col).remove(new BasicDBObject("_id", obj.getObjectId("_id")));
        if (result.getError() == null) {
            history.addHistory(col, ido);
            return obj;
        }
        return null;
    }

    public BasicDBList query(String col, BasicDBObject obj) {
        DBCursor cursor = db.getCollection(col).find(obj);
        BasicDBList result = new BasicDBList();
        while (cursor.hasNext()) {
            result.add(cursor.next());
        }
        return result;
    }

    public BasicDBList query(String col, BasicDBObject obj, BasicDBObject keys) {
        DBCursor cursor = db.getCollection(col).find(obj, keys);
        BasicDBList result = new BasicDBList();
        while (cursor.hasNext()) {
            result.add(cursor.next());
        }
        return result;
    }
}
