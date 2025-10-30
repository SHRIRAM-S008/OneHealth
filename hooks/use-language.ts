"use client"

import { useContext } from "react"
import { LanguageContext } from "@/components/language/language-provider"

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
