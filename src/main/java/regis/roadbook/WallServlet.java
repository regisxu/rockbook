package regis.roadbook;

import java.io.BufferedReader;
import java.io.IOException;
import java.net.UnknownHostException;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import com.mongodb.util.JSON;

public class WallServlet extends HttpServlet {

    private DBService db;

    public WallServlet() throws UnknownHostException {
        db = DBService.getInstance();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String path = request.getPathInfo();
        if (path.startsWith("/")) {
            path = path.substring(1);
        } else {
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }

        BasicDBObject json = new BasicDBObject();
        json.put("id", path);

        BasicDBObject dbObject = (BasicDBObject) db.query("wall", Utils.dbo(json)).get(0);

        enrich(dbObject);
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().println(Utils.json(dbObject).toString());
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

        list = (BasicDBList) dbObject.remove("topos");
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
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException,
            IOException {
        if (!request.getContentType().toLowerCase().contains("application/json")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        BufferedReader reader = request.getReader();
        BasicDBObject json = (BasicDBObject) JSON.parse(Utils.readString(reader));
        if (json.get("id") != null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        BasicDBObject dbo = db.insert("wall", Utils.dbo(json));
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().println(Utils.json(dbo));
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        if (!request.getContentType().toLowerCase().contains("application/json")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        BufferedReader reader = request.getReader();
        BasicDBObject json = (BasicDBObject) JSON.parse(Utils.readString(reader));
        if (json.get("id") == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        BasicDBObject simple = simplify(json);
        BasicDBObject dbo = db.update("wall", Utils.dbo(simple));
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().println(Utils.json(dbo));
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException,
            IOException {
        String path = request.getPathInfo();
        if (path.startsWith("/")) {
            path = path.substring(1);
        } else {
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }
        BasicDBObject json = new BasicDBObject();
        json.put("id", path);

        if (db.delete("wall", Utils.dbo(json)) == null) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        } else {
            response.setStatus(HttpServletResponse.SC_OK);
        }
    }

    private BasicDBObject simplify(BasicDBObject json) {
        if (json.get("images") != null) {
            List<String> iids = ((BasicDBList) json.get("images")).stream()
                    .map(entry -> {
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

        if (json.get("topos") != null) {
            List<String> tids = ((BasicDBList) ((BasicDBObject) json.remove("topo")).get("routes")).stream()
                    .map(entry -> ((BasicDBObject) entry).getString("tid")).collect(Collectors.toList());
            BasicDBList tlist = new BasicDBList();
            tlist.addAll(tids);
            json.put("topos", tlist);
        }
        return json;
    }
}
