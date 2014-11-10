package rocks.guidebook;

import java.net.UnknownHostException;

import org.bson.types.ObjectId;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;

public class DBUtils {

    private static DBService db;

    static {
        try {
            db = DBService.getInstance();
        } catch (UnknownHostException e) {
            throw new RuntimeException(e);
        }
    }

    public static BasicDBObject buildParent(String res, ObjectId id) {
        switch (res) {
        case "route":
            BasicDBObject wallQuery = new BasicDBObject("routes", id);
            BasicDBList walls = db.query("wall", wallQuery);
            if (!walls.isEmpty()) {
                BasicDBObject wall = new BasicDBObject();
                wall.put("wid", ((BasicDBObject) walls.get(0)).getObjectId("_id"));
                wall.put("name", ((BasicDBObject) walls.get(0)).getString("name"));
                BasicDBObject parent = buildParent("wall", wall.getObjectId("wid"));
                if (parent != null) {
                    wall.put("parent", parent);
                }
                return wall;
            } else {
                return null;
            }
        case "wall":
            BasicDBObject areaQuery = new BasicDBObject("walls", id);
            BasicDBList areas = db.query("area", areaQuery);
            if (!areas.isEmpty()) {
                BasicDBObject area = new BasicDBObject();
                area.put("aid", ((BasicDBObject) areas.get(0)).getObjectId("_id"));
                area.put("name", ((BasicDBObject) areas.get(0)).getString("name"));
                BasicDBObject parent = buildParent("area", area.getObjectId("aid"));
                if (parent != null) {
                    area.put("parent", parent);
                }
                return area;
            } else {
                return null;
            }
        case "area":
            BasicDBObject query = new BasicDBObject("areas", id);
            BasicDBList as = db.query("area", query);
            if (!as.isEmpty()) {
                BasicDBObject area = new BasicDBObject();
                area.put("aid", ((BasicDBObject) as.get(0)).getObjectId("_id"));
                area.put("name", ((BasicDBObject) as.get(0)).getString("name"));
                BasicDBObject parent = buildParent("area", area.getObjectId("aid"));
                if (parent != null) {
                    area.put("parent", parent);
                }
                return area;
            } else {
                return null;
            }
        default:
            return null;
        }
    }
}
