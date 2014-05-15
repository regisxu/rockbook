package regis.roadbook;

import java.io.IOException;
import java.net.UnknownHostException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class AuthenticationFilter implements Filter {

    private UserService user;

    public AuthenticationFilter() throws UnknownHostException {
        user = new UserService();
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // TODO Auto-generated method stub

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException,
            ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        String path = req.getPathInfo();
        if (path != null && (path.endsWith("signUp") || path.endsWith("signIn"))) {
            chain.doFilter(request, response);
            return;
        }
        System.out.println(req.getPathInfo());
        if (!"GET".equalsIgnoreCase(req.getMethod())) {
            if (!isLogin(req)) {
                HttpServletResponse res = (HttpServletResponse) response;
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private boolean isLogin(HttpServletRequest req) {
        String session = req.getHeader("session");
        String email = req.getHeader("email");

        if (email != null && session != null) {
            return user.isLogin(email, session);
        }
        return false;
    }

    @Override
    public void destroy() {
        // TODO Auto-generated method stub

    }

}
