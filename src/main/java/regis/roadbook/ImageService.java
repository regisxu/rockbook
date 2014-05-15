package regis.roadbook;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.UnknownHostException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import org.bson.types.ObjectId;

import com.mongodb.BasicDBObject;
import com.mongodb.util.JSON;

public class ImageService extends HttpServlet {

    private DBService db;

    public ImageService() throws UnknownHostException {
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

        BasicDBObject dbObject = (BasicDBObject) db.query("image", Utils.dbo(json)).get(0);
        String name = (String) dbObject.get("name");
        int index = name.lastIndexOf(".");
        String type = "jpg";
        if (index != -1) {
            type = name.substring(index + 1);
        }
        response.setContentType("image/" + type);
        response.setStatus(HttpServletResponse.SC_OK);
        OutputStream out = response.getOutputStream();
        try (BufferedInputStream in = new BufferedInputStream(new FileInputStream((String) dbObject.get("path")))) {
            byte[] bs = new byte[1024 * 4];
            int count = 0;
            while ((count = in.read(bs)) != -1) {
                out.write(bs, 0, count);
            }
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException,
            IOException {
        if (request.getContentType() == null || !request.getContentType().toLowerCase().contains("multipart/form-data")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        BasicDBObject image = new BasicDBObject();
        image.put("_id", new ObjectId());
        request.getParts().stream().forEach(p -> {
            switch (p.getName()) {
            case "file":
                try {
                    for (String field : p.getHeader("content-disposition").split(";")) {
                        String[] kv = field.split("=");
                        if (kv.length == 2 && "filename".equalsIgnoreCase(kv[0].trim())) {
                            if (kv[1].length() >= 2) {
                                image.put("name", kv[1].substring(1, kv[1].length() - 1));
                            }
                        }

                    }
                    String name = image.getString("name");
                    String suffix = name.substring(name.lastIndexOf(".") + 1);
                    String path = "images/" + buildFileName(image.getObjectId("_id").toString(), suffix);
                    saveImage(path, p.getInputStream());
                    image.put("path", path);
                } catch (Exception e) {
                    // TODO Auto-generated catch block
                e.printStackTrace();
            }
                break;
            case "ref":
                BasicDBObject ref = parseRef(p);
                image.put("col", ref.get("col"));
                image.put("rid", Utils.oid((String) ref.get("rid")));
                break;
            }
        });

        BasicDBObject dbo = db.insert("image", image);
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().println(Utils.json(dbo));
    }

    private BasicDBObject parseRef(Part p) {
        try (InputStream in = p.getInputStream()) {
            return (BasicDBObject) JSON.parse(Utils.readString(in));
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    private void saveImage(String file, InputStream in) throws IOException {
        byte[] bs = new byte[1024 * 4];
        try (OutputStream out = new BufferedOutputStream(new FileOutputStream(file))) {
            int count = 0;
            while ((count = in.read(bs)) != -1) {
                out.write(bs, 0, count);
            }
            out.flush();
        }
    }

    private String buildFileName(String id, String suffix) {
        return id + "." + suffix;
    }

    private String saveImage(Part part, ObjectId oid) throws IOException {
        byte[] bs = new byte[1024 * 4];
        try (InputStream in = part.getInputStream();) {
            String path = "images/" + oid.toString();
            try (OutputStream out = new BufferedOutputStream(new FileOutputStream(path))) {
                int count = 0;
                while ((count = in.read(bs)) != -1) {
                    out.write(bs, 0, count);
                }
                out.flush();
                return path;
            }
        }
    }

    private String readContent(InputStream in) {
        StringBuilder builder = new StringBuilder();
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(in));
            String line = null;
            while ((line = reader.readLine()) != null) {
                builder.append(line).append("\n");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return builder.toString();
    }
}
