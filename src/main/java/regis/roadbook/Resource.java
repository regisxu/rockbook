package regis.roadbook;

import com.mongodb.BasicDBObject;

public interface Resource {

    public BasicDBObject get(String id);

    public BasicDBObject delete(String id);

    public BasicDBObject put(BasicDBObject obj);

    public BasicDBObject post(BasicDBObject obj);

}
