"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Moon, Sun, Home, BookOpen, History, Settings, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Mood-based themes
const moodThemes = {
  happy: {
    primary: "bg-amber-500",
    secondary: "bg-amber-100",
    text: "text-amber-950",
    accent: "bg-amber-300",
    border: "border-amber-300",
    gradient: "from-amber-100 to-amber-50",
    name: "Happy",
    emoji: "😊",
  },
  calm: {
    primary: "bg-sky-500",
    secondary: "bg-sky-100",
    text: "text-sky-950",
    accent: "bg-sky-300",
    border: "border-sky-300",
    gradient: "from-sky-100 to-sky-50",
    name: "Calm",
    emoji: "😌",
  },
  sad: {
    primary: "bg-indigo-500",
    secondary: "bg-indigo-100",
    text: "text-indigo-950",
    accent: "bg-indigo-300",
    border: "border-indigo-300",
    gradient: "from-indigo-100 to-indigo-50",
    name: "Reflective",
    emoji: "😔",
  },
  anxious: {
    primary: "bg-purple-500",
    secondary: "bg-purple-100",
    text: "text-purple-950",
    accent: "bg-purple-300",
    border: "border-purple-300",
    gradient: "from-purple-100 to-purple-50",
    name: "Focused",
    emoji: "😰",
  },
  neutral: {
    primary: "bg-slate-500",
    secondary: "bg-slate-100",
    text: "text-slate-950",
    accent: "bg-slate-300",
    border: "border-slate-300",
    gradient: "from-slate-100 to-slate-50",
    name: "Neutral",
    emoji: "😐",
  },
}

type MoodType = keyof typeof moodThemes

export default function Layout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false)
  const [currentMood, setCurrentMood] = useState<MoodType>("neutral")
  const pathname = usePathname()

  // This would be replaced with actual mood detection from your backend
  useEffect(() => {
    // Simulate mood detection - in real app, this would come from your NLP/emotional analysis
    const moods: MoodType[] = ["happy", "calm", "sad", "anxious", "neutral"]
    const detectMood = () => {
      // This is just a placeholder - your actual implementation would use the backend
      return moods[Math.floor(Math.random() * moods.length)]
    }

    // Set initial mood
    setCurrentMood(detectMood())

    // Update mood periodically (for demo purposes)
    const interval = setInterval(() => {
      // In a real app, this would be triggered by new journal entries or analysis
      // setCurrentMood(detectMood())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const theme = moodThemes[currentMood]

  return (
    <div className={cn("min-h-screen bg-background font-sans antialiased", darkMode ? "dark" : "")}>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="flex flex-col gap-0 px-2">
            <div className={cn("flex items-center gap-2 rounded-lg px-3 py-2", theme.primary)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">{theme.emoji}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">SerenityAI</h3>
                <p className="text-xs text-white/80">Mood: {theme.name}</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/journal"}>
                  <Link href="/journal">
                    <BookOpen className="h-4 w-4" />
                    <span>New Journal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/history"}>
                  <Link href="/history">
                    <History className="h-4 w-4" />
                    <span>Journal History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/ask-serenity"}>
                  <Link href="/ask-serenity">
                    <Sparkles className="h-4 w-4" />
                    <span>Ask Serenity</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <Separator className="my-4" />
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="px-2">
            <Button variant="outline" size="icon" onClick={toggleDarkMode} className="w-full justify-start px-2">
              {darkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main
          className={cn("flex-1 p-4 md:p-6 pt-16 md:pt-6 transition-all duration-200 bg-gradient-to-b", theme.gradient)}
        >
          <div className="md:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">SerenityAI</h1>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  )
}

