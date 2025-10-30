"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  const mainItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/cases", label: "Cases" },
    { href: "/dashboard/upload", label: "Upload" },
    { href: "/dashboard/outbreaks", label: "Outbreaks" },
    { href: "/dashboard/analytics", label: "Analytics" },
  ]

  const additionalItems = [
    { href: "/dashboard/reports", label: "Reports" },
    { href: "/dashboard/data-quality", label: "Data Quality" },
    { href: "/dashboard/predictions", label: "Predictions" },
    { href: "/dashboard/settings", label: "Settings" },
    { href: "/dashboard/organization", label: "Organization" },
  ]

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-card border-b border-border shadow-lg z-40">
          <nav className="flex flex-col">
            <div className="border-b border-border">
              {mainItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-3 border-b border-border hover:bg-muted text-sm font-medium block"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="bg-muted/50">
              {additionalItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-3 border-b border-border hover:bg-muted text-sm font-medium block"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
