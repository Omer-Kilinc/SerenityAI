"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, Clock, Send, Loader2, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Layout from "@/components/layout"
import { Timeline } from "@/components/timeline"

// Mock significant events extracted from journal entries
const mockSignificantEvents = [
  // ... (keep your existing mock events)
]

// Initial conversation with Serenity AI
const initialConversation = [
  {
    role: "assistant",
    content:
      "Hi Erin, I've analyzed your recent journal entries. I noticed you mentioned feeling stressed about work deadlines. Would you like to talk more about what's causing this stress?",
  },
]

export default function AskSerenityPage() {
  const [timeRange, setTimeRange] = useState("week")
  const [conversation, setConversation] = useState(initialConversation)
  const [userInput, setUserInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [expandedEvents, setExpandedEvents] = useState<number[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!userInput.trim()) return

    // Add user message to conversation
    setConversation([...conversation, { role: "user", content: userInput }])
    setUserInput("")
    setIsLoading(true)

    try {
      // Send the user's message to the backend
      const response = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userInput }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from Serenity AI")
      }

      const data = await response.json()

      // Add the AI's response to the conversation
      setConversation((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error("Error sending message:", error)
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process your request. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Scroll to bottom of conversation when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation])

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Ask Serenity</h1>
        <p className="text-muted-foreground">
          Explore insights from your journal entries and chat with Serenity AI about your wellbeing.
        </p>

        {/* Remove the grid and other sections */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Chat with Serenity
            </CardTitle>
            <CardDescription>Ask questions or get personalized insights</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="h-[calc(100vh-250px)] overflow-y-auto pr-2 space-y-4">
              {conversation.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-3 w-3" />
                        <span className="text-xs font-medium">Serenity AI</span>
                      </div>
                    )}
                    {message.role === "user" && (
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-xs font-medium">You</span>
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-3 w-3" />
                      <span className="text-xs font-medium">Serenity AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            <div className="flex w-full items-center gap-2">
              <Textarea
                placeholder="Type your message..."
                className="min-h-10 flex-1 resize-none"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button size="icon" onClick={handleSendMessage} disabled={!userInput.trim() || isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  )
}