"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Send, Loader2, Image, Paperclip, Smile } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Layout from "@/components/layout"

// Mock prompts to help users journal
const journalPrompts = [
  "How would you describe your day today?",
  "What made you smile today?",
  "Did you face any challenges? How did you handle them?",
  "What are you grateful for today?",
  "How did you take care of yourself today?",
  "What's something you learned today?",
  "How are you feeling physically right now?",
  "What's something you're looking forward to?",
]

export default function JournalPage() {
  const [journalText, setJournalText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState(journalPrompts[0])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Function to handle voice recording (mock implementation)
  const toggleRecording = () => {
    setIsRecording(!isRecording)

    // In a real implementation, this would use the Web Speech API
    // or another speech recognition service
    if (!isRecording) {
      // Start recording simulation
      setTimeout(() => {
        setJournalText(
          (prev) =>
            prev +
            (prev ? " " : "") +
            "This is simulated voice input that would be replaced with actual transcription in the real app.",
        )
        setIsRecording(false)
      }, 3000)
    }
  }

  // Function to handle journal submission
  const handleSubmit = () => {
    if (!journalText.trim()) return

    setIsSubmitting(true)

    // This would send the journal entry to your backend for processing
    // with the NLP and emotional analysis
    setTimeout(() => {
      setIsSubmitting(false)
      setJournalText("")
      // In a real app, you would redirect to the dashboard or show a success message
      alert("Journal entry submitted successfully!")
    }, 2000)
  }

  // Function to select a random prompt
  const getRandomPrompt = () => {
    const newPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)]
    setCurrentPrompt(newPrompt)
  }

  // Focus textarea on load
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">New Journal Entry</h1>
        <p className="text-muted-foreground">
          Express your thoughts, feelings, and experiences. Your entries help SerenityAI understand your wellbeing.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Today's Journal</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="write">
              <TabsList className="mb-4">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="prompt">Use Prompt</TabsTrigger>
              </TabsList>

              <TabsContent value="write" className="space-y-4">
                <Textarea
                  ref={textareaRef}
                  placeholder="How are you feeling today? What's on your mind?"
                  className="min-h-[200px] resize-none"
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                />
              </TabsContent>

              <TabsContent value="prompt" className="space-y-4">
                <div className="bg-muted p-4 rounded-md mb-4">
                  <p className="font-medium mb-2">Prompt:</p>
                  <p>{currentPrompt}</p>
                  <Button variant="outline" size="sm" onClick={getRandomPrompt} className="mt-2">
                    Try Another Prompt
                  </Button>
                </div>

                <Textarea
                  placeholder="Respond to the prompt..."
                  className="min-h-[200px] resize-none"
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                />
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleRecording}
                  className={isRecording ? "bg-red-100 text-red-500 animate-pulse" : ""}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {isRecording ? "Recording... Click to stop" : "Click to record your voice"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Image className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <div className="grid grid-cols-6 gap-2">
                      {["😊", "😌", "😔", "😢", "😡", "😰", "🥰", "😴", "🤔", "😎", "🙂", "😕"].map((emoji, i) => (
                        <button
                          key={i}
                          className="text-2xl hover:bg-muted p-2 rounded-md"
                          onClick={() => setJournalText((prev) => prev + emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">{journalText.length} characters</p>
            <Button onClick={handleSubmit} disabled={!journalText.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Journal
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How Journaling Helps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="font-medium">Self-Reflection</h3>
                <p className="text-sm text-muted-foreground">
                  Regular journaling helps you understand your thoughts and emotions better.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Stress Reduction</h3>
                <p className="text-sm text-muted-foreground">
                  Writing about your feelings can help reduce stress and anxiety.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Personalized Insights</h3>
                <p className="text-sm text-muted-foreground">
                  SerenityAI analyzes your entries to provide tailored insights about your wellbeing patterns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

