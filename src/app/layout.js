import { Geist, Geist_Mono } from "next/font/google"
import AppProviderWrapper from "./AppProviderWrapper"
import Navigation from "@/components/Navigation"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "AI Teacher",
  description: "AI-powered learning platform",
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Navigation />
        <AppProviderWrapper>
          <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
            {children}
          </main>
        </AppProviderWrapper>
      </body>
    </html>
  )
}