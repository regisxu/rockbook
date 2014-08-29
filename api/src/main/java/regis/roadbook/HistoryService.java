package regis.roadbook;

import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.WriteResult;

public class HistoryService {

    private DBCollection history;

    public HistoryService(DB db) {
        history = db.getCollection("history");
    }

    public void addHistory(String col, BasicDBObject dbo) {
        BasicDBObject clone = new BasicDBObject(dbo.toMap());
        BasicDBObject item = new BasicDBObject();
        item.append("col", col);
        item.append("rid", clone.remove("_id"));
        item.append("value", clone);
        WriteResult result = history.insert(item);
        if (result.getError() != null) {
            System.err.println(result.toString());
        }
    }
}
