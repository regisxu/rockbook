package rocks.guidebook;

import java.net.UnknownHostException;
import java.util.List;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;

public class WallService implements Resource {

    private DBService db;

    public WallService() throws UnknownHostException {
        db = DBService.getInstance();
    }

    @Override
    public BasicDBObject get(String id) {
        BasicDBObject json = new BasicDBObject();
        json.put("id", id);

        BasicDBList list = db.query("wall", Utils.dbo(json));
        if (list.isEmpty()) {
            return null;
        }
        BasicDBObject dbObject = (BasicDBObject) list.get(0);

        enrich(dbObject);

        return Utils.json(dbObject);
    }

    @Override
    public BasicDBObject delete(String id) {
        if (db.delete("wall", Utils.dbo(new BasicDBObject("id", id))) == null) {
            return null;
        }
        return new BasicDBObject("id", id);
    }

    @Override
    public BasicDBObject post(BasicDBObject json) {
        BasicDBObject dbo = db.insert("wall", Utils.dbo(json));
        return dbo == null ? null : Utils.json(dbo);
    }

    @Override
    public BasicDBObject put(BasicDBObject json) {
        BasicDBObject simple = simplify(json);
        BasicDBObject dbo = db.update("wall", Utils.dbo(simple));
        return dbo == null ? null : Utils.json(dbo);
    }

    private void enrich(BasicDBObject dbObject) {
        BasicDBList list = (BasicDBList) dbObject.get("images");
        if (list != null && list.size() > 0) {
            BasicDBObject imageQuery = new BasicDBObject("_id", new BasicDBObject("$in", list));
            BasicDBList images = db.query("image", imageQuery);
            dbObject.put("images", images);
        }

        list = (BasicDBList) dbObject.get("routes");
        if (list != null && !list.isEmpty()) {
            BasicDBObject routeQuery = new BasicDBObject("_id", new BasicDBObject("$in", list));
            BasicDBList routes = db.query("route", routeQuery);
            dbObject.put("routes", routes);
        }

        list = (BasicDBList) dbObject.remove("topo");
        if (list != null && !list.isEmpty()) {
            BasicDBObject routeQuery = new BasicDBObject("_id", new BasicDBObject("$in", list));
            BasicDBList routes = db.query("topo", routeQuery);
            if (routes != null && !routes.isEmpty()) {
                BasicDBObject route = (BasicDBObject) routes.get(0);
                BasicDBObject pic = new BasicDBObject("id", Utils.id(route.getObjectId("pid")));
                pic.append("height", route.getString("height"));
                pic.append("width", route.getString("width"));
                BasicDBObject topo = new BasicDBObject("pic", pic);
                List<BasicDBObject> tmp = routes.stream().map(entry -> {
                    BasicDBObject obj = new BasicDBObject();
                    obj.append("id", ((BasicDBObject) entry).get("rid"));
                    obj.append("bolts", ((BasicDBObject) entry).get("bolts"));
                    obj.append("tid", ((BasicDBObject) entry).get("_id"));
                    return obj;
                }).collect(Collectors.toList());
                BasicDBList dbList = new BasicDBList();
                dbList.addAll(tmp);
                topo.append("routes", dbList);
                dbObject.put("topo", topo);
            }
        }

        BasicDBObject parent = DBUtils.buildParent("wall", dbObject.getObjectId("_id"));
        if (parent != null) {
            dbObject.put("parent", parent);
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

        if (json.get("routes") != null) {
            List<String> rids = ((BasicDBList) json.get("routes")).stream()
                    .map(entry -> ((BasicDBObject) entry).getString("id")).collect(Collectors.toList());
            BasicDBList rlist = new BasicDBList();
            rlist.addAll(rids);
            json.put("routes", rlist);
        }

        if (json.get("topo") != null) {
            BasicDBObject topo = ((BasicDBObject) json.remove("topo"));
            List<String> tids = ((BasicDBList) topo.get("routes")).stream()
                    .map(entry -> ((BasicDBObject) entry).getString("tid")).collect(Collectors.toList());
            BasicDBList tlist = new BasicDBList();
            tlist.addAll(tids);
            json.put("topo", tlist);
        }
        return json;
    }
}
