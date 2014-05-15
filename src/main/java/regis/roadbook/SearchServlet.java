package regis.roadbook;

import java.io.IOException;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;

public class SearchServlet extends HttpServlet {

    private DBService db;

    public SearchServlet() throws UnknownHostException {
        db = DBService.getInstance();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Map<String, String> para = new HashMap<>();
        request.getParameterMap().forEach((key, value) -> para.put(key, convert(value)));
        String res = (String) para.remove("res");
        if (res == null || res.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        BasicDBList list = db.query(res, new BasicDBObject(para));
        list.forEach(dbo -> Utils.json((BasicDBObject) dbo));
        response.getWriter().println(list);
        return;
    }

    private String convert(String[] sa) {
        String result = "";
        for (String s : sa) {
            result += s;
        }
        return result;
    }
}
