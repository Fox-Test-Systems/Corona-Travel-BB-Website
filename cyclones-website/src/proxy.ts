import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — required to keep auth working in App Router
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect player portal pages (allow /portal/login through)
  if (
    pathname.startsWith("/portal/") &&
    !pathname.startsWith("/portal/login")
  ) {
    if (!user) {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }
  }

  // Protect coach admin pages — must be authenticated AND have coach role
  if (pathname.startsWith("/admin/")) {
    if (!user) {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }
    if (user.user_metadata?.role !== "coach") {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*"],
};
