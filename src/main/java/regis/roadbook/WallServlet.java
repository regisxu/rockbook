package regis.roadbook;

import java.io.BufferedReader;
import java.io.IOException;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.bson.types.ObjectId;

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
        if ("search".equals(path)) {
            Map<String, String> para = new HashMap<>();
            request.getParameterMap().forEach((key, value) -> para.put(key, convert(value)));
            BasicDBList list = db.query("wall", new BasicDBObject(para));
            Stream<ObjectId> stream = list.stream().map(entry -> ((BasicDBObject) entry).getObjectId("_id"));
            List<ObjectId> ids = stream.collect(Collectors.toList());
            BasicDBObject imageQuery = new BasicDBObject();
            imageQuery.append("rid", new BasicDBObject("$in", ids));
            BasicDBList images = db.query("image", imageQuery);
            Map<ObjectId, List<Object>> group = images.stream().collect(
                    Collectors.groupingBy(entry -> ((BasicDBObject) entry).getObjectId("rid")));
            list.stream().forEach(entry -> {
                ObjectId id = ((BasicDBObject) entry).getObjectId("_id");
                if (group.containsKey(id)) {
                    ((BasicDBObject) entry).put("image", Utils.id(((BasicDBObject) group.get(id).get(0)).getObjectId("_id")));
                }
            });
            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_OK);
            BasicDBList array = new BasicDBList();
            list.stream().forEach(o -> array.add(Utils.json((BasicDBObject) o)));
            response.getWriter().println(array.toString());
            return;
        }
        BasicDBObject json = new BasicDBObject();
        json.put("id", path);

        BasicDBObject dbObject = (BasicDBObject) db.query("wall", Utils.dbo(json)).get(0);
        BasicDBList list = (BasicDBList) dbObject.get("images");
        if (list != null && list.size() > 0) {
            BasicDBObject imageQuery = new BasicDBObject("_id", new BasicDBObject("$in", list));
            BasicDBList images = db.query("image", imageQuery);
            dbObject.put("images", images);
        }
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().println(Utils.json(dbObject).toString());
    }

    private String convert(String[] sa) {
        String result = "";
        for (String s : sa) {
            result += s;
        }
        return result;
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

        BasicDBObject dbo = db.update("wall", Utils.dbo(json));
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().println(Utils.json(dbo));
    }
}
