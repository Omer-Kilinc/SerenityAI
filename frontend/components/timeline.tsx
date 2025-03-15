import type React from "react"
import { cn } from "@/lib/utils"

interface TimelineProps {
  children: React.ReactNode
  className?: string
}

interface TimelineItemProps {
  children: React.ReactNode
  className?: string
}

interface TimelinePointProps {
  className?: string
}

interface TimelineContentProps {
  children: React.ReactNode
  className?: string
}

const Timeline = ({ children, className }: TimelineProps) => {
  return (
    <div
      className={cn(
        "relative space-y-6 after:absolute after:inset-0 after:ml-5 after:h-full after:w-0.5 after:-translate-x-1/2 after:bg-muted",
        className,
      )}
    >
      {children}
    </div>
  )
}

const TimelineItem = ({ children, className }: TimelineItemProps) => {
  return <div className={cn("relative flex gap-6", className)}>{children}</div>
}

const TimelinePoint = ({ className }: TimelinePointProps) => {
  return (
    <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background">
      <div className={cn("h-2 w-2 rounded-full bg-current", className)} />
    </div>
  )
}

const TimelineContent = ({ children, className }: TimelineContentProps) => {
  return <div className={cn("flex-1 pt-1", className)}>{children}</div>
}

Timeline.Item = TimelineItem
Timeline.Point = TimelinePoint
Timeline.Content = TimelineContent

export { Timeline }

