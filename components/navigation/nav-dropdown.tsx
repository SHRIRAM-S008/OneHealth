"use client"

import { useState } from "react"
import { MoreVertical, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/hooks/use-language"

export function NavDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  const additionalItems = [
    { href: "/dashboard/reports", label: t("reports") },
    { href: "/dashboard/data-quality", label: t("dataQuality") },
    { href: "/dashboard/predictions", label: t("predictions") },
    { href: "/dashboard/settings", label: t("settings") },
    { href: "/dashboard/organization", label: t("organization") },
  ]

  return (
    <div className="relative hidden md:block">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1">
        <MoreVertical className="w-4 h-4" />
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
          <nav className="flex flex-col py-2">
            {additionalItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 hover:bg-muted text-sm font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
