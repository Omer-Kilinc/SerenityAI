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
  {
    id: 1,
    date: "2025-03-10",
    time: "09:00",
    title: "Work Presentation",
    description: "Gave a presentation to the team about the new project. Received positive feedback.",
    mood: "happy",
    category: "work",
  },
  {
    id: 2,
    date: "2025-03-11",
    time: "18:30",
    title: "Dinner with Friends",
    description: "Had dinner with college friends at the new Italian restaurant downtown.",
    mood: "happy",
    category: "social",
  },
  {
    id: 3,
    date: "2025-03-12",
    time: "15:00",
    title: "Argument with Colleague",
    description: "Had a disagreement with a colleague about project priorities.",
    mood: "anxious",
    category: "work",
  },
  {
    id: 4,
    date: "2025-03-13",
    time: "07:30",
    title: "Morning Run",
    description: "Went for a 5k run in the park. Felt energized afterward.",
    mood: "happy",
    category: "exercise",
  },
  {
    id: 5,
    date: "2025-03-14",
    time: "22:00",
    title: "Trouble Sleeping",
    description: "Had difficulty falling asleep due to work stress.",
    mood: "anxious",
    category: "health",
  },
  {
    id: 6,
    date: "2025-03-15",
    time: "12:00",
    title: "Lunch with Mom",
    description: "Had lunch with mom and caught up on family news.",
    mood: "calm",
    category: "family",
  },
]

// Mock conversation with Gemini
const initialConversation = [
  {
    role: "assistant",
    content:
      "Hi Erin, I've analyzed your recent journal entries. I noticed you mentioned feeling stressed about work deadlines. Would you like to talk more about what's causing this stress?",
  },
]

// Category colors
const categoryColors = {
  work: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
  social: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
  exercise: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  health: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
  family: "bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100",
}

// Mood emoji mapping
const moodEmojis = {
  happy: "😊",
  calm: "😌",
  sad: "😔",
  anxious: "😰",
  neutral: "😐",
}

export default function AskSerenityPage() {
  const [timeRange, setTimeRange] = useState("week")
  const [conversation, setConversation] = useState(initialConversation)
  const [userInput, setUserInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [expandedEvents, setExpandedEvents] = useState<number[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Filter events based on time range
  const filteredEvents = mockSignificantEvents.filter((event) => {
    // In a real app, this would filter based on the actual date range
    return true
  })

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  // Toggle event expansion
  const toggleEventExpansion = (eventId: number) => {
    if (expandedEvents.includes(eventId)) {
      setExpandedEvents(expandedEvents.filter((id) => id !== eventId))
    } else {
      setExpandedEvents([...expandedEvents, eventId])
    }
  }

  // Handle sending a message
  const handleSendMessage = () => {
    if (!userInput.trim()) return

    // Add user message to conversation
    setConversation([...conversation, { role: "user", content: userInput }])
    setUserInput("")
    setIsLoading(true)

    // Simulate Gemini response
    setTimeout(() => {
      // Mock responses based on user input
      let response = ""

      if (userInput.toLowerCase().includes("stress") || userInput.toLowerCase().includes("work")) {
        response =
          "I see that work has been a source of stress lately. Your journal entries show a pattern of increased anxiety on days with tight deadlines. Have you tried any stress management techniques that worked for you in the past?"
      } else if (userInput.toLowerCase().includes("sleep") || userInput.toLowerCase().includes("tired")) {
        response =
          "Your sleep patterns seem to be affected by your stress levels. I noticed you had trouble sleeping on March 14th. Your Garmin data shows you only got 5.5 hours that night. Would establishing a bedtime routine help?"
      } else if (userInput.toLowerCase().includes("exercise") || userInput.toLowerCase().includes("run")) {
        response =
          "I've noticed that your mood tends to improve after physical activity like your morning run on March 13th. Have you considered scheduling regular exercise sessions to help manage stress?"
      } else {
        response =
          "Thank you for sharing that. Based on your journal patterns, I've noticed that you tend to feel better after social interactions. Would you like me to suggest some activities that might help improve your mood?"
      }

      setConversation((prev) => [...prev, { role: "assistant", content: response }])
      setIsLoading(false)
    }, 2000)
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

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Significant Events</CardTitle>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Past Week</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                      <SelectItem value="quarter">Past 3 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>Key moments extracted from your journal entries</CardDescription>
              </CardHeader>
              <CardContent>
                <Timeline>
                  {filteredEvents.map((event) => (
                    <Timeline.Item key={event.id}>
                      <Timeline.Point />
                      <Timeline.Content>
                        <Card className="mb-4">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{moodEmojis[event.mood as keyof typeof moodEmojis]}</span>
                                <CardTitle className="text-base">{event.title}</CardTitle>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => toggleEventExpansion(event.id)}>
                                {expandedEvents.includes(event.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(event.date)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{event.time}</span>
                              </div>
                            </div>
                          </CardHeader>
                          {expandedEvents.includes(event.id) && (
                            <>
                              <CardContent className="p-4 pt-0">
                                <p className="text-sm">{event.description}</p>
                              </CardContent>
                              <CardFooter className="p-4 pt-0">
                                <Badge className={categoryColors[event.category as keyof typeof categoryColors]}>
                                  {event.category}
                                </Badge>
                              </CardFooter>
                            </>
                          )}
                        </Card>
                      </Timeline.Content>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Overview</CardTitle>
                <CardDescription>A summary of your week based on journal entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Mood Patterns</h3>
                    <p className="text-sm text-muted-foreground">
                      Your mood has been generally positive with some anxiety related to work deadlines.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Sleep Quality</h3>
                    <p className="text-sm text-muted-foreground">
                      Your sleep quality has been inconsistent, with disruptions on nights following stressful workdays.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Social Interactions</h3>
                    <p className="text-sm text-muted-foreground">
                      You've had positive social interactions that have improved your overall mood.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Physical Activity</h3>
                    <p className="text-sm text-muted-foreground">
                      Exercise has been a positive influence on your wellbeing, particularly morning activities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Chat with Serenity
                </CardTitle>
                <CardDescription>Ask questions or get personalized insights</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden">
                <div className="h-[500px] overflow-y-auto pr-2 space-y-4">
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
        </div>
      </div>
    </Layout>
  )
}

