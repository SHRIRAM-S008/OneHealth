"use client"

import { useLanguage } from "@/hooks/use-language"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
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
}
