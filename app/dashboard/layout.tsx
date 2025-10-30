import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { ToastProvider } from "@/components/notifications/toast-provider"
import { MobileNav } from "@/components/mobile/mobile-nav"
import { NavDropdown } from "@/components/navigation/nav-dropdown"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // REMOVED: Redirect logic for public access
  // Allow all users to access the dashboard (public access)
  // if (!user) {
  //   redirect("/auth/login")
  // }

  const handleLogout = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold">OneHealth Grid</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Disease Surveillance Platform</p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {user ? (
                <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
              ) : (
                <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">Public Access</span>
              )}
              {/* REMOVED: LanguageSwitcher from dashboard header since it's now in settings */}
              <NotificationBell />
              {user ? (
                <form action={handleLogout} className="hidden sm:block">
                  <Button type="submit" variant="outline" size="sm">
                    Logout
                  </Button>
                </form>
              ) : (
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
              )}
              <MobileNav />
            </div>
          </div>
        </header>

        {/* Navigation - Desktop Only - Main Pages */}
        <nav className="border-b border-border bg-card hidden md:block sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex gap-6 overflow-x-auto py-3">
              <Link
                href="/dashboard"
                className="py-1 px-2 border-b-2 border-transparent hover:border-primary text-sm font-medium whitespace-nowrap"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/cases"
                className="py-1 px-2 border-b-2 border-transparent hover:border-primary text-sm font-medium whitespace-nowrap"
              >
                Cases
              </Link>
              <Link
                href="/dashboard/upload"
                className="py-1 px-2 border-b-2 border-transparent hover:border-primary text-sm font-medium whitespace-nowrap"
              >
                Upload
              </Link>
              <Link
                href="/dashboard/outbreaks"
                className="py-1 px-2 border-b-2 border-transparent hover:border-primary text-sm font-medium whitespace-nowrap"
              >
                Outbreaks
              </Link>
              <Link
                href="/dashboard/analytics"
                className="py-1 px-2 border-b-2 border-transparent hover:border-primary text-sm font-medium whitespace-nowrap"
              >
                Analytics
              </Link>
              <Link
                href="/dashboard/reports"
                className="py-1 px-2 border-b-2 border-transparent hover:border-primary text-sm font-medium whitespace-nowrap"
              >
                Reports
              </Link>
            </div>
            {/* 3-dot menu at the end of navigation bar */}
            <div className="py-3">
              <NavDropdown />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">{children}</main>
      </div>
    </ToastProvider>
  )
}