package regis.roadbook;

import java.io.BufferedReader;
import java.io.IOException;
import java.net.UnknownHostException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.mongodb.BasicDBObject;
import com.mongodb.util.JSON;

public class ResourceServlet extends HttpServlet {

    private Resource resource;

    private static final String CONTENT_TYPE = "application/json;charset=utf-8";

    @Override
    public void init() throws ServletException {
        resource = getResource(getInitParameter("resource"));
    }

    private Resource getResource(String name) {
        try {
            switch (name) {
            case "wall":
                return new WallService();
            case "route":
                return new RouteService();
            case "topo":
                return new TopoService();
            default:
                throw new RuntimeException("Can't find service for resource " + name);
            }
        } catch (UnknownHostException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        if (!request.getPathInfo().startsWith("/")) {
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }

        String id = getIdFromPath(request.getPathInfo());
        if (id == null || id.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        BasicDBObject obj = resource.get(id);
        if (obj == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        response.setContentType(CONTENT_TYPE);
        response.getWriter().write(obj.toString());
    }

    private String getIdFromPath(String path) {
        return path.substring(1);
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

        BasicDBObject obj = resource.post(json);
        if (obj == null) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }
        response.setContentType(CONTENT_TYPE);
        response.getWriter().write(obj.toString());
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        if (!request.getContentType().toLowerCase().contains("application/json")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        BufferedReader reader = request.getReader();
        BasicDBObject json = (BasicDBObject) JSON.parse(Utils.readString(reader));
        if (json.get("id") == null || json.getString("id").trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        BasicDBObject obj = resource.put(json);
        if (obj == null) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }
        response.setContentType(CONTENT_TYPE);
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().write(obj.toString());
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException,
            IOException {
        if (!request.getPathInfo().startsWith("/")) {
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }

        BasicDBObject obj = resource.delete(getIdFromPath(request.getPathInfo()));
        if (obj == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        } else {
            response.setStatus(HttpServletResponse.SC_OK);
        }

    }
}
