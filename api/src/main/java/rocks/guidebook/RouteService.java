package rocks.guidebook;

import java.net.UnknownHostException;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;

public class RouteService implements Resource {

    private DBService db;

    public RouteService() throws UnknownHostException {
        db = DBService.getInstance();
    }

    @Override
    public BasicDBObject get(String id) {
        BasicDBObject json = new BasicDBObject();
        json.put("id", id);
        BasicDBList list = db.query("route", Utils.dbo(json));
        if (list.isEmpty()) {
            return null;
        }

        BasicDBObject dbObject = (BasicDBObject) list.get(0);
        enrich(dbObject);

        return Utils.json(dbObject);
    }

    @Override
    public BasicDBObject delete(String id) {
        if (db.delete("route", Utils.dbo(new BasicDBObject("id", id))) == null) {
            return null;
        }
        return new BasicDBObject("id", id);
    }

    @Override
    public BasicDBObject put(BasicDBObject json) {
        BasicDBObject dbo = db.update("route", Utils.dbo(json));
        return dbo == null ? null : Utils.json(dbo);
    }

    @Override
    public BasicDBObject post(BasicDBObject json) {
        BasicDBObject dbo = db.insert("route", Utils.dbo(json));
        return dbo == null ? null : Utils.json(dbo);
    }

    private void enrich(BasicDBObject dbObject) {
        BasicDBList imagesIds = (BasicDBList) dbObject.get("images");
        if (imagesIds != null && imagesIds.size() > 0) {
            BasicDBObject imageQuery = new BasicDBObject("_id", new BasicDBObject("$in", imagesIds));
            BasicDBList images = db.query("image", imageQuery);
            dbObject.put("images", images);
        }

        BasicDBObject wallQuery = new BasicDBObject("routes", dbObject.getObjectId("_id"));
        BasicDBList walls = db.query("wall", wallQuery);
        if (!walls.isEmpty()) {
            BasicDBObject parent = new BasicDBObject();
            parent.put("wid", ((BasicDBObject) walls.get(0)).getObjectId("_id"));
            parent.put("name", ((BasicDBObject) walls.get(0)).getString("name"));
            dbObject.put("parent", parent);
        }
    }
}
