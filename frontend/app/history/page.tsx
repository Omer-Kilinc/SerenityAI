"use client"

import { useState, useEffect } from "react"
import { Calendar, Search, ChevronDown, ArrowUpDown, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Layout from "@/components/layout"

// Mood emoji mapping
const moodEmojis = {
  happy: "😊",
  calm: "😌",
  sad: "😔",
  anxious: "😰",
  neutral: "😐",
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [moodFilter, setMoodFilter] = useState("all")
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [journalEntries, setJournalEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch journal entries from the backend
  useEffect(() => {
    const fetchJournalEntries = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/journal-entries")
        if (!response.ok) {
          throw new Error("Failed to fetch journal entries")
        }
        const data = await response.json()
        setJournalEntries(data)
      } catch (error) {
        console.error("Error fetching journal entries:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJournalEntries()
  }, [])

  // Filter entries based on search query and mood filter
  const filteredEntries = journalEntries.filter((entry) => {
    const matchesSearch =
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.activities.some((activity) => activity.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesMood = moodFilter === "all" || entry.mood === moodFilter

    return matchesSearch && matchesMood
  })

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p>Loading journal entries...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Journal History</h1>
        <p className="text-muted-foreground">Review your past journal entries and track your emotional journey.</p>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries or tags..."
              className="pl-8 w-full md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={moodFilter} onValueChange={setMoodFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moods</SelectItem>
                <SelectItem value="happy">Happy 😊</SelectItem>
                <SelectItem value="calm">Calm 😌</SelectItem>
                <SelectItem value="sad">Sad 😔</SelectItem>
                <SelectItem value="anxious">Anxious 😰</SelectItem>
                <SelectItem value="neutral">Neutral 😐</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Newest First</DropdownMenuItem>
                <DropdownMenuItem>Oldest First</DropdownMenuItem>
                <DropdownMenuItem>Mood (Positive to Negative)</DropdownMenuItem>
                <DropdownMenuItem>Mood (Negative to Positive)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Mood</TableHead>
                      <TableHead className="hidden md:table-cell">Preview</TableHead>
                      <TableHead className="hidden md:table-cell">Tags</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.length > 0 ? (
                      filteredEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className="font-medium">{formatDate(entry.date)}</div>
                            <div className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleTimeString()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{moodEmojis[entry.mood as keyof typeof moodEmojis]}</span>
                              <span className="capitalize">{entry.mood}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                            {entry.content.substring(0, 60)}...
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {entry.activities.map((activity) => (
                                <Badge key={activity} variant="outline" className="text-xs">
                                  {activity}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedEntry(entry)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No journal entries found matching your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Journal Calendar</CardTitle>
                <CardDescription>View your journal entries by date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>Calendar view would display entries by date with mood indicators</p>
                  <p className="text-sm mt-2">This would be implemented with a calendar component</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedEntry && (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>
                    {formatDate(selectedEntry.date)} - {new Date(selectedEntry.date).toLocaleTimeString()}
                  </span>
                  <span className="text-xl">{moodEmojis[selectedEntry.mood as keyof typeof moodEmojis]}</span>
                </CardTitle>
                <CardDescription>
                  Mood: <span className="capitalize">{selectedEntry.mood}</span>
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedEntry(null)}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{selectedEntry.content}</p>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Tags:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedEntry.activities.map((activity) => (
                    <Badge key={activity} variant="secondary">
                      {activity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-medium mb-2">AI Analysis:</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Wellbeing Score:</strong> {selectedEntry.wellbeing_score}/100
                  </p>
                  <p className="text-sm">
                    <strong>Tone Analysis:</strong> {selectedEntry.tone_analysis}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                Previous Entry
              </Button>
              <Button variant="outline" size="sm">
                Next Entry
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </Layout>
  )
}