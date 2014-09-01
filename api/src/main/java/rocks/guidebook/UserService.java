package rocks.guidebook;

import java.net.UnknownHostException;

import org.bson.types.ObjectId;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;

public class UserService {

    private DBService db;

    public UserService() throws UnknownHostException {
        db = DBService.getInstance();
    }

    public BasicDBObject signUp(BasicDBObject json) {
        BasicDBObject query = new BasicDBObject("email", json.getString("email"));
        BasicDBList list = db.query("user", query);
        if (list.size() > 0) {
            return new BasicDBObject("error", "Email is already registered.");
        }
        BasicDBObject user = db.insert("user", json);
        if (user != null) {
            user.append("session", new ObjectId().toString());
            db.update("user", user);
            return user;
        }
        return new BasicDBObject("error", "Sign up failed.");
    }

    public BasicDBObject signIn(BasicDBObject json) {
        BasicDBList list = db.query("user", json);
        if (list == null || list.size() == 0) {
            return new BasicDBObject("error", "User does not exist.");
        }
        BasicDBObject user = (BasicDBObject) list.get(0);
        user.append("session", new ObjectId().toString());
        db.update("user", user);
        return user;
    }

    public boolean isLogin(String email, String session) {
        BasicDBObject query = new BasicDBObject();
        query.append("email", email);
        query.append("session", session);
        BasicDBList list = db.query("user", query);
        if (list == null || list.size() == 0) {
            return false;
        }
        return true;
    }
}
