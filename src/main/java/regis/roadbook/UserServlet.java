package regis.roadbook;

import java.io.BufferedReader;
import java.io.IOException;
import java.net.UnknownHostException;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.bson.types.ObjectId;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import com.mongodb.util.JSON;

public class UserServlet extends HttpServlet {

    private UserService user;

    public UserServlet() throws UnknownHostException {
        user = new UserService();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException,
            IOException {
        if (!request.getContentType().toLowerCase().contains("application/json")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        String path = request.getPathInfo();
        if (path.startsWith("/")) {
            path = path.substring(1);
        } else {
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }

        BufferedReader reader = request.getReader();
        BasicDBObject json = (BasicDBObject) JSON.parse(Utils.readString(reader));

        BasicDBObject result = null;
        if ("signIn".equals(path)) {
            result = user.signIn(json);
        } else if ("signUp".equals(path)) {
            result = user.signUp(json);
        }

        if (result.getString("email") != null) {
            response.addHeader("session", result.getString("session"));
        }
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().println(Utils.json(result));
    }
}
