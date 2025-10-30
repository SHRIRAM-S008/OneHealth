"use client"

import { useLanguage } from "@/hooks/use-language"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  // Try to use the language context, but provide a fallback if not available
  try {
    const { language, setLanguage } = useLanguage()

    return (
      <div className="flex items-center gap-1">
        <Button
          variant={language === "en" ? "default" : "outline"}
          size="sm"
          onClick={() => setLanguage("en")}
          className="text-xs"
        >
          EN
        </Button>
        <Button
          variant={language === "hi" ? "default" : "outline"}
          size="sm"
          onClick={() => setLanguage("hi")}
          className="text-xs"
        >
          HI
        </Button>
      </div>
    )
  } catch (error) {
    // Fallback UI when context is not available
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.setItem("language", "en")
              window.location.reload()
            }
          }}
          className="text-xs"
        >
          EN
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.setItem("language", "hi")
              window.location.reload()
            }
          }}
          className="text-xs"
        >
          HI
        </Button>
      </div>
    )
  }
}