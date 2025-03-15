"use client"

import { useState } from "react"
import { Activity, Moon, Zap, Smile, Frown, Meh, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Layout from "@/components/layout"
import Link from "next/link"
import axios from "axios"
import { useEffect } from "react"


export default function Dashboard() {
  // Mock data - would be replaced with actual data from your backend
  const [wellbeingScore, setWellbeingScore] = useState(0)
  const [sleepScore, setSleepScore] = useState(0)
  const [stressScore, setStressScore] = useState(0)
  const [moodDistribution, setMoodDistribution] = useState({
    positive: 65,
    neutral: 25,
    negative: 10,
  })
  const [insights, setInsights] = useState([
    "Your mood tends to improve after physical activity",
    "You've been consistently journaling for 7 days",
    "Your sleep quality correlates with positive mood entries",
    "Morning journaling seems to set a positive tone for your day",
  ])

  const [weeklyWellbeingScores, setWeeklyWellbeingScores] = useState([
    { day: "Mon", score: 0 },
    { day: "Tue", score: 0 },
    { day: "Wed", score: 0 },
    { day: "Thu", score: 0 },
    { day: "Fri", score: 0 },
    { day: "Sat", score: 0 },
    { day: "Sun", score: 0 },
  ]);

  useEffect(() => {
    // Fetch the wellbeing score from the backend
    const fetchWellbeingScore = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/wellbeing-score")
        const data = response.data
        setWellbeingScore(data.wellbeing_score)  // Update the state with the fetched score
      } catch (error) {
        console.error("Error fetching wellbeing score:", error)
        setWellbeingScore(0)  // Fallback to 0 if there's an error
      }
    }

    fetchWellbeingScore()
  }, [])  // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    const fetchSleepData = async () => {
      try {
        const response = await axios.post("http://127.0.0.1:5000/analyze-Garmin", {
          requestType: 1,  // Request sleep data
        })
        const data = response.data
  
        // Extract the sleep score from the response
        const sleepScore = data.Sleep[0].sleepScore
        setSleepScore(sleepScore)  // Update the state with the fetched sleep score
      } catch (error) {
        console.error("Error fetching sleep data:", error)
        setSleepScore(0)  // Fallback to 0 if there's an error
      }
    }
  
    fetchSleepData()
  }, [])

  useEffect(() => {
    const fetchStressData = async () => {
      try {
        const response = await axios.post("http://127.0.0.1:5000/analyze-Garmin", {
          requestType: 4,  // Request activity data
        });
        const data = response.data;
  
        // Extract the activity score from the response
        const stressScore = data["Stress Level"][0]; // Adjust based on the actual response structure
        setStressScore(stressScore);  // Update the state with the fetched activity score
      } catch (error) {
        console.error("Error fetching activity data:", error);
        setStressScore(0);  // Fallback to 0 if there's an error
      }
    };
  
    fetchStressData();
  }, []);

  useEffect(() => {
    const fetchWeeklyWellbeingScores = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/wellbeing-scores-last-7-days");
        const data = response.data;

        // Map the fetched data to the weeklyWellbeingScores state
        const updatedScores = data.map((score, index) => ({
          day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index], // Map days to the fetched data
          score: score.wellbeing_score,
        }));

        setWeeklyWellbeingScores(updatedScores);
      } catch (error) {
        console.error("Error fetching weekly wellbeing scores:", error);
        // Fallback to default values if there's an error
        setWeeklyWellbeingScores([
          { day: "Mon", score: 0 },
          { day: "Tue", score: 0 },
          { day: "Wed", score: 0 },
          { day: "Thu", score: 0 },
          { day: "Fri", score: 0 },
          { day: "Sat", score: 0 },
          { day: "Sun", score: 0 },
        ]);
      }
    };

    fetchWeeklyWellbeingScores();
  }, []);

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Erin</h1>
        <p className="text-muted-foreground">
          Here's an overview of your wellbeing and insights from your journal entries.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wellbeing Score</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wellbeingScore}/100</div>
              <Progress value={wellbeingScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">+5% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sleep Quality</CardTitle>
              <Moon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sleepScore}/100</div>
              <Progress value={sleepScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">7.5 hours avg. duration</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stress Level</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stressScore}/100</div>
              <Progress value={stressScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">8,500 steps daily average</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Weekly Mood Trends</CardTitle>
              <CardDescription>Your emotional patterns over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-end justify-between">
                {weeklyWellbeingScores.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div
                      className="w-12 bg-primary rounded-t-md transition-all duration-500 ease-in-out"
                      style={{ height: `${day.score * 1.5}px` }}
                    ></div>
                    <span className="text-xs font-medium">{day.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">Your mood has been generally positive this week</p>
            </CardFooter>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Mood Distribution</CardTitle>
              <CardDescription>Breakdown of your emotional states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smile className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Positive</span>
                    </div>
                    <span className="text-sm font-medium">{moodDistribution.positive}%</span>
                  </div>
                  <Progress value={moodDistribution.positive} className="h-2 bg-muted" indicatorColor="bg-green-500" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Meh className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">Neutral</span>
                    </div>
                    <span className="text-sm font-medium">{moodDistribution.neutral}%</span>
                  </div>
                  <Progress value={moodDistribution.neutral} className="h-2 bg-muted" indicatorColor="bg-amber-500" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Frown className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Negative</span>
                    </div>
                    <span className="text-sm font-medium">{moodDistribution.negative}%</span>
                  </div>
                  <Progress value={moodDistribution.negative} className="h-2 bg-muted" indicatorColor="bg-red-500" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">Based on sentiment analysis of your journal entries</p>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Personalized observations based on your journaling patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/journal">
                Create New Journal Entry
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Garmin Sleep Data</CardTitle>
              <CardDescription>Your sleep patterns from Garmin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Deep Sleep</p>
                  <p className="text-sm text-muted-foreground">2h 15m</p>
                </div>
                <Progress value={45} className="w-1/2" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Light Sleep</p>
                  <p className="text-sm text-muted-foreground">4h 30m</p>
                </div>
                <Progress value={70} className="w-1/2" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">REM Sleep</p>
                  <p className="text-sm text-muted-foreground">1h 45m</p>
                </div>
                <Progress value={35} className="w-1/2" />
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">Last night's sleep quality: Good</p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Garmin Activity Data</CardTitle>
              <CardDescription>Your exercise metrics from Garmin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Steps</p>
                  <p className="text-sm text-muted-foreground">8,542 steps</p>
                </div>
                <Progress value={85} className="w-1/2" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Active Minutes</p>
                  <p className="text-sm text-muted-foreground">45 minutes</p>
                </div>
                <Progress value={60} className="w-1/2" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Calories</p>
                  <p className="text-sm text-muted-foreground">2,350 kcal</p>
                </div>
                <Progress value={78} className="w-1/2" />
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">Today's activity level: Moderate</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

