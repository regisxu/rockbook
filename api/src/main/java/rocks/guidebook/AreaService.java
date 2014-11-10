package rocks.guidebook;

import java.net.UnknownHostException;
import java.util.List;
import java.util.stream.Collectors;

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
        BasicDBObject dbo = db.insert("area", Utils.dbo(json));
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
}
