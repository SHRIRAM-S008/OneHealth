import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )

  // This will be used to refresh the user's session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // REMOVED: Redirect logic for public access
  // Allow all users to access all pages (public access)
  // if (!user && !request.nextUrl.pathname.startsWith("/auth") && !request.nextUrl.pathname.startsWith("/")) {
  //   // no user, potentially respond by redirecting the user to the login page
  //   const url = request.nextUrl.clone()
  //   url.pathname = "/auth/login"
  //   return NextResponse.redirect(url)
  // }

  // IMPORTANT: You *must* return the `supabaseResponse` object as it is.
  // If you return a new NextResponse Object, make sure to:
  // 1. Pass the request in it: `new NextResponse(response.body, { request })`
  // 2. Copy over the cookies, like this:
  // ```
  // const cookies = response.cookies.getSetCookie()
  // cookieStore.setAll(cookies)
  // ```
  return supabaseResponse
}