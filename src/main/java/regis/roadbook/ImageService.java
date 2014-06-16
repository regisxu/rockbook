package regis.roadbook;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.UnknownHostException;
import java.util.Optional;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import org.bson.types.ObjectId;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;

public class ImageService extends HttpServlet {

    private DBService db;

    private String repo;

    private File base;

    public ImageService() throws UnknownHostException {
        db = DBService.getInstance();
        base = new File(System.getProperty("app.base.dir"));
        repo = AppProperties.get("image.repo");
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

        BasicDBList result = db.query("image", Utils.dbo(json));
        if (result.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        BasicDBObject dbObject = (BasicDBObject) result.get(0);
        String name = (String) dbObject.get("name");
        int index = name.lastIndexOf(".");
        String type = "jpg";
        if (index != -1) {
            type = name.substring(index + 1);
        }
        response.setContentType("image/" + type);
        response.setStatus(HttpServletResponse.SC_OK);
        OutputStream out = response.getOutputStream();
        try (BufferedInputStream in = new BufferedInputStream(new FileInputStream(new File(base, (String) dbObject.get("path"))))) {
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

        Optional<Part> op = request.getParts().stream().filter(entry -> "file".equals(entry.getName())).findFirst();
        if (!op.isPresent()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        BasicDBObject image = new BasicDBObject();
        image.put("_id", new ObjectId());
        for (String field : op.get().getHeader("content-disposition").split(";")) {
            String[] kv = field.split("=");
            if (kv.length == 2 && "filename".equalsIgnoreCase(kv[0].trim())) {
                if (kv[1].length() >= 2) {
                    image.put("name", kv[1].substring(1, kv[1].length() - 1));
                }
            }

        }

        String name = image.getString("name");
        String suffix = name.substring(name.lastIndexOf(".") + 1);
        String path = repo + "/" + buildFileName(image.getObjectId("_id").toString(), suffix);
        saveImage(new File(base, path), op.get().getInputStream());
        image.put("path", path);

        BasicDBObject dbo = db.insert("image", image);
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().println(Utils.json(dbo));
    }

    private void saveImage(File file, InputStream in) throws IOException {
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
}
