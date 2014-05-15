package regis.roadbook;

import java.io.BufferedReader;
import java.io.IOException;
import java.net.UnknownHostException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import com.mongodb.util.JSON;

public class RouteServlet extends HttpServlet {
    private DBService db;

    public RouteServlet() throws UnknownHostException {
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

        BasicDBObject dbObject = (BasicDBObject) db.query("route", Utils.dbo(json)).get(0);
        BasicDBList list = (BasicDBList) dbObject.get("images");
        if (list != null && list.size() > 0) {
            BasicDBObject imageQuery = new BasicDBObject("_id", new BasicDBObject("$in", list));
            BasicDBList images = db.query("image", imageQuery);
            dbObject.put("images", images);
        }

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().println(Utils.json(dbObject));
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
        BasicDBObject dbo = db.insert("route", Utils.dbo(json));
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
        BasicDBList list = db.query("route", new BasicDBObject("_id", Utils.oid((String) json.get("id"))));
        if (list == null || list.size() != 1) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        BasicDBObject value = Utils.dbo(json);
        BasicDBObject dbo = db.update("route", value);
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().println(Utils.json(dbo));
    }
}
