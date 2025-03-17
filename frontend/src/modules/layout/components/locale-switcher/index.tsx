"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

export const LocaleSwitcher = () => {
  const [locale, setLocale] = useState("ua")
  const router = useRouter()

  useEffect(() => {
    const storedLocale = Cookies.get("NEXT_LOCALE")
    if (storedLocale) {
      setLocale(storedLocale)
    }
  }, [])

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value
    setLocale(newLocale)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/`
    router.refresh() // Refresh page to apply new language
  }

  return (
    <div>
      <select value={locale} onChange={handleChange}>
        <option value="ua">UA</option>
        <option value="ru">RU</option>
        <option value="ro">RO</option>
        <option value="en">EN</option>
      </select>
    </div>
  )
}
