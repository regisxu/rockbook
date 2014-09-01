package rocks.guidebook;

import java.net.UnknownHostException;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;

public class TopoService implements Resource {

    private DBService db;

    public TopoService() throws UnknownHostException {
        db = DBService.getInstance();
    }

    @Override
    public BasicDBObject get(String id) {
        BasicDBObject json = new BasicDBObject();

        json.put("id", id);
        BasicDBList list = db.query("topo", Utils.dbo(json));
        if (list.isEmpty()) {
            return null;
        }
        BasicDBObject dbObject = (BasicDBObject) list.get(0);
        return Utils.json(dbObject);
    }

    @Override
    public BasicDBObject delete(String id) {
        if (db.delete("topo", Utils.dbo(new BasicDBObject("id", id))) == null) {
            return null;
        }
        return new BasicDBObject("id", id);
    }

    @Override
    public BasicDBObject put(BasicDBObject json) {
        BasicDBObject dbo = db.update("topo", Utils.dbo(json));
        return dbo == null ? null : Utils.json(dbo);
    }

    @Override
    public BasicDBObject post(BasicDBObject json) {
        BasicDBObject dbo = db.insert("topo", Utils.dbo(json));
        return dbo == null ? null : Utils.json(dbo);
    }
}
