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

public class TopoServlet extends HttpServlet {

    private DBService db;

    public TopoServlet() throws UnknownHostException {
        db = DBService.getInstance();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String path = request.getPathInfo();
        BasicDBObject result = null;
        if (path != null && path.startsWith("/")) {
            path = path.substring(1);
            BasicDBList list = db.query("topo", new BasicDBObject("_id", Utils.oid(path)));
            if (!list.isEmpty()) {
                result = (BasicDBObject) list.get(0);
            }
        } else {
            String rid = request.getParameter("rid");
            if (rid != null) {
                BasicDBList list = db.query("topo", new BasicDBObject("rid", Utils.oid(rid)));
                if (!list.isEmpty()) {
                    result = (BasicDBObject) list.get(0);
                }
            } else {
                String wid = request.getParameter("wid");
                if (wid != null) {
                    BasicDBList rids = db.query("route", new BasicDBObject("wid", Utils.oid(wid)), new BasicDBObject(
                            "_id", "1"));
                    BasicDBList list = db.query("topo", new BasicDBObject("rid", new BasicDBObject("$in", rids)));
                    if (!list.isEmpty()) {
                        result = new BasicDBObject("wid", wid);
                        result.put("topos", list);
                    }
                }
            }
        }

        if (result == null) {
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }

        response.setContentType("application/json;charset=utf-8");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().println(Utils.json(result));
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
        BasicDBObject dbo = db.insert("topo", Utils.dbo(json));
        response.setContentType("application/json;charset=utf-8");
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
        BasicDBList list = db.query("topo", new BasicDBObject("_id", Utils.oid((String) json.get("id"))));
        if (list == null || list.size() != 1) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        BasicDBObject value = Utils.dbo(json);
        BasicDBObject dbo = db.update("topo", value);
        response.setContentType("application/json;charset=utf-8");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().println(Utils.json(dbo));

    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException,
            IOException {

    }
}
