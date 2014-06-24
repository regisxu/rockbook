package regis.roadbook;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.UnknownHostException;
import java.util.Optional;
import java.util.regex.Pattern;

import javax.imageio.ImageIO;
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

    private static final Pattern SIZE_PATTERN = Pattern.compile("[1-9]\\d*[xX][1-9]\\d*|0");

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

        if (isResize(request.getParameter("size"))) {
            String[] p = request.getParameter("size").trim().split("[xX]");
            int width = Integer.parseInt(p[0]);
            int height = Integer.parseInt(p[1]);
            BufferedImage img = ImageIO.read(new File(base, dbObject.getString("path")));
            if (width == 0 && height == 0) {
                width = img.getWidth();
                height = img.getHeight();
            } else if (width == 0) {
                width = img.getWidth() * height / img.getHeight();
            } else if (height == 0) {
                height = img.getHeight() * width / img.getWidth();
            }
            BufferedImage rimg = new BufferedImage(width, height, img.getType());
            Graphics2D g = rimg.createGraphics();
            g.drawImage(img, 0, 0, width, height, null);
            g.dispose();
            ImageIO.write((BufferedImage) rimg, type, out);
        } else {
            try (BufferedInputStream in = new BufferedInputStream(new FileInputStream(new File(base,
                    dbObject.getString("path"))))) {
                byte[] bs = new byte[1024 * 4];
                int count = 0;
                while ((count = in.read(bs)) != -1) {
                    out.write(bs, 0, count);
                }
            }
        }
    }

    private boolean isResize(String size) {
        return size != null && SIZE_PATTERN.matcher(size.trim()).find();
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
        byte[] bs = toBytes(op.get().getInputStream());
        BufferedImage bufferedImage = ImageIO.read(new ByteArrayInputStream(bs));
        image.put("height", bufferedImage.getHeight());
        image.put("width", bufferedImage.getWidth());
        saveImage(new File(base, path), new ByteArrayInputStream(bs));
        image.put("path", path);

        BasicDBObject dbo = db.insert("image", image);
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().println(Utils.json(dbo));
    }

    private byte[] toBytes(InputStream in) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] bs = new byte[1024 * 4];
            int count = 0;
            while ((count = in.read(bs)) != -1) {
                out.write(bs, 0, count);
            }
            out.flush();
            return out.toByteArray();
        }
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
