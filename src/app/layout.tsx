import type { Metadata } from "next"
import { Fraunces, Outfit } from "next/font/google"
import { Providers } from "@/app/providers"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
})

export const metadata: Metadata = {
  title: {
    default: "NECRT — North East CRT desk",
    template: "%s · NECRT",
  },
  description:
    "A casual relief teacher desk for North East Victoria. Schools push out a day. CRTs take it. The school confirms.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-AU"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
