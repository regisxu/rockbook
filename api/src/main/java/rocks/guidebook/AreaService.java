package rocks.guidebook;

import java.net.UnknownHostException;
import java.util.List;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;

public class AreaService implements Resource {

    private DBService db;

    public AreaService() throws UnknownHostException {
        db = DBService.getInstance();
    }

    @Override
    public BasicDBObject get(String id) {
        BasicDBObject json = new BasicDBObject();
        json.put("id", id);

        BasicDBList list = db.query("area", Utils.dbo(json));
        if (list.isEmpty()) {
            return null;
        }
        BasicDBObject dbo = (BasicDBObject) list.get(0);

        enrich(dbo);

        return Utils.json(dbo);
    }

    @Override
    public BasicDBObject delete(String id) {
        if (db.delete("area", Utils.dbo(new BasicDBObject("id", id))) == null) {
            return null;
        }
        return new BasicDBObject("id", id);
    }

    @Override
    public BasicDBObject put(BasicDBObject json) {
        BasicDBObject simple = simplify(json);
        BasicDBObject dbo = db.update("area", Utils.dbo(simple));
        return dbo == null ? null : Utils.json(dbo);
    }

    @Override
    public BasicDBObject post(BasicDBObject json) {
        BasicDBObject simple = simplify(json);
        BasicDBObject dbo = db.insert("area", Utils.dbo(simple));
        return dbo == null ? null : Utils.json(dbo);
    }

    private void enrich(BasicDBObject dbo) {
        BasicDBList list = (BasicDBList) dbo.get("images");
        if (list != null && list.size() > 0) {
            BasicDBObject imageQuery = new BasicDBObject("_id", new BasicDBObject("$in", list));
            BasicDBList images = db.query("image", imageQuery);
            dbo.put("images", images);
        }

        list = (BasicDBList) dbo.get("walls");
        if (list != null && !list.isEmpty()) {
            BasicDBObject wallQuery = new BasicDBObject("_id", new BasicDBObject("$in", list));
            BasicDBList walls = db.query("wall", wallQuery);
            dbo.put("walls", walls);
        }

        list = (BasicDBList) dbo.get("areas");
        if (list != null && !list.isEmpty()) {
            BasicDBObject areaQuery = new BasicDBObject("_id", new BasicDBObject("$in", list));
            BasicDBList areas = db.query("areas", areaQuery);
            dbo.put("areas", areas);
        }

        BasicDBObject parent = buildParent("area", dbo.getObjectId("_id"));
        if (parent != null) {
            dbo.put("parent", parent);
        }
    }

    private BasicDBObject simplify(BasicDBObject json) {
        if (json.get("images") != null) {
            List<String> iids = ((BasicDBList) json.get("images")).stream().map(entry -> {
                if (entry instanceof BasicDBObject) {
                    return ((BasicDBObject) entry).getString("id");
                } else {
                    return (String) entry;
                }
            }).collect(Collectors.toList());
            BasicDBList ilist = new BasicDBList();
            ilist.addAll(iids);
            json.put("images", ilist);
        }

        if (json.get("walls") != null) {
            List<String> wids = ((BasicDBList) json.get("walls")).stream()
                    .map(entry -> ((BasicDBObject) entry).getString("id")).collect(Collectors.toList());
            BasicDBList rlist = new BasicDBList();
            rlist.addAll(wids);
            json.put("walls", rlist);
        }

        if (json.get("areas") != null) {
            List<String> aids = ((BasicDBList) json.get("areas")).stream()
                    .map(entry -> ((BasicDBObject) entry).getString("id")).collect(Collectors.toList());
            BasicDBList rlist = new BasicDBList();
            rlist.addAll(aids);
            json.put("areas", rlist);
        }

        return json;
    }

    private BasicDBObject buildParent(String res, ObjectId id) {
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
