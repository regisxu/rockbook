package regis.roadbook;

import com.mongodb.BasicDBObject;

public interface Resource {

    public BasicDBObject get(String id);

    public BasicDBObject delete(String id);

    public BasicDBObject put(BasicDBObject json);

    public BasicDBObject post(BasicDBObject json);

}
