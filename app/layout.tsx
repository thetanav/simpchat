import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme_provider";
import { Toaster } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const sans = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://simpchat.vercel.app"),
  title: {
    default: "Simp Chat",
    template: "%s • Simp Chat",
  },
  description: "Simple AI chat with lots of models and tools.",
  applicationName: "Simp Chat",
  keywords: ["AI", "chat", "OpenRouter", "Groq", "Perplexity", "Gemini"],
  authors: [{ name: "tanav", url: "https://tanavindev.tech" }],
  creator: "tanav",
  openGraph: {
    type: "website",
    title: "Simp Chat",
    description: "Simple AI chat with lots of models and tools.",
    url: "/",
    siteName: "Simp Chat",
  },
  twitter: {
    card: "summary_large_image",
    title: "Simp Chat",
    description: "Simple AI chat with lots of models and tools.",
    creator: "@tanav_twt",
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body
        className={`${sans.className} antialiased min-h-screen bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange>
          <Toaster position="top-right" closeButton />
          <SidebarProvider>
            <AppSidebar />
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
