'use client'

import { AppProvider } from "@/context/AppContext"

export default function AppProviderWrapper({ children }) {
  return <AppProvider>{children}</AppProvider>
}
