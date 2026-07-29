import { NextRequest, NextResponse } from "next/server";

// Public routes accessible without logging in
const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];

// Admin-only routes
const adminOnlyPaths = ["/admin", "/users"];

// Seller-only routes
const sellerOnlyPaths = ["/seller"];

/**
 * Next.js Edge Routing Proxy.
 * Secures routes matching role-based access rules.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Retrieve token and user data directly from request cookies
  const token = req.cookies.get("auth_token")?.value;
  const userDataStr = req.cookies.get("user_data")?.value;

  let user = null;
  if (token && userDataStr) {
    try {
      user = JSON.parse(decodeURIComponent(userDataStr));
    } catch {
      // JSON parse fallback
    }
  }

  const roleName =
    typeof user?.role === "string"
      ? user.role
      : user?.role?.name || user?.roleId?.roleName || user?.role?.roleName;

  const isAdmin = roleName?.toLowerCase() === "admin";
  const isSeller =
    roleName?.toLowerCase() === "seller" || user?.sellerStatus === "approved";

  const isPublicPath = publicPaths.some((path) => {
    // root should match only exactly "/"
    if (path === "/") return pathname === "/";
    // other public paths match the path or its sub-routes
    return pathname === path || pathname.startsWith(`${path}/`);
  });

  const isAdminOnlyPath = adminOnlyPaths.some((path) =>
    pathname.startsWith(path)
  );

  const isSellerOnlyPath = sellerOnlyPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Not logged in → redirect to login
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Logged in but trying to access admin-only route
  if (user && isAdminOnlyPath && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Logged in but trying to access seller-only route
  if (user && isSellerOnlyPath && !isSeller) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Logged in user should not access public pages (/, login, signup, etc.)
  if (user && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/users/:path*",
    "/seller/:path*",
    "/dashboard/:path*",
    "/account/:path*",
    "/bookings/:path*",
    "/my-repairs/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/",
  ],
};
