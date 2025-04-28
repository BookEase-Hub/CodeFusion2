"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Download,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  UserMinus,
  UserCog,
  FileEdit,
  Trash2,
  FolderPlus,
  FolderMinus,
  Settings,
  LogIn,
  LogOut,
  AlertTriangle,
  ShieldAlert,
  Calendar,
} from "lucide-react"
import { format } from "date-fns"

// Mock activity data
const mockActivities = [
  {
    id: "1",
    action: "User Created",
    description: "New user account created",
    user: "Admin1",
    target: "John Doe",
    timestamp: new Date(2023, 11, 15, 10, 30),
    category: "user",
    icon: UserPlus,
  },
  {
    id: "2",
    action: "User Role Updated",
    description: "User role changed from User to Admin",
    user: "Admin2",
    target: "Jane Smith",
    timestamp: new Date(2023, 11, 15, 9, 45),
    category: "user",
    icon: UserCog,
  },
  {
    id: "3",
    action: "Project Created",
    description: "New project created: E-commerce Platform",
    user: "Admin1",
    target: "E-commerce Platform",
    timestamp: new Date(2023, 11, 14, 16, 20),
    category: "project",
    icon: FolderPlus,
  },
  {
    id: "4",
    action: "Project Deleted",
    description: "Project deleted: Legacy System",
    user: "Admin2",
    target: "Legacy System",
    timestamp: new Date(2023, 11, 14, 14, 15),
    category: "project",
    icon: FolderMinus,
  },
  {
    id: "5",
    action: "User Deleted",
    description: "User account deleted",
    user: "Admin1",
    target: "Bob Johnson",
    timestamp: new Date(2023, 11, 13, 11, 30),
    category: "user",
    icon: UserMinus,
  },
  {
    id: "6",
    action: "Settings Updated",
    description: "System settings updated",
    user: "Admin2",
    target: "System Settings",
    timestamp: new Date(2023, 11, 13, 10, 0),
    category: "system",
    icon: Settings,
  },
  {
    id: "7",
    action: "Admin Login",
    description: "Admin logged in",
    user: "Admin1",
    target: "System",
    timestamp: new Date(2023, 11, 12, 9, 30),
    category: "auth",
    icon: LogIn,
  },
  {
    id: "8",
    action: "Admin Logout",
    description: "Admin logged out",
    user: "Admin2",
    target: "System",
    timestamp: new Date(2023, 11, 12, 17, 45),
    category: "auth",
    icon: LogOut,
  },
  {
    id: "9",
    action: "Security Alert",
    description: "Multiple failed login attempts detected",
    user: "System",
    target: "Security",
    timestamp: new Date(2023, 11, 11, 14, 20),
    category: "security",
    icon: ShieldAlert,
  },
  {
    id: "10",
    action: "Project Updated",
    description: "Project details updated: Mobile App",
    user: "Admin1",
    target: "Mobile App",
    timestamp: new Date(2023, 11, 11, 11, 10),
    category: "project",
    icon: FileEdit,
  },
  {
    id: "11",
    action: "User Banned",
    description: "User account banned for policy violation",
    user: "Admin2",
    target: "Charlie Brown",
    timestamp: new Date(2023, 11, 10, 16, 30),
    category: "user",
    icon: AlertTriangle,
  },
  {
    id: "12",
    action: "Content Removed",
    description: "Inappropriate content removed from project",
    user: "Admin1",
    target: "Social Media App",
    timestamp: new Date(2023, 11, 10, 13, 45),
    category: "content",
    icon: Trash2,
  },
]

export default function ActivityLogs() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const activitiesPerPage = 8

  // Filter activities based on search query and filters
  const filteredActivities = mockActivities.filter((activity) => {
    const matchesSearch =
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.target.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || activity.category === categoryFilter

    let matchesDate = true
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)
    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    if (dateFilter === "today") {
      matchesDate = activity.timestamp.toDateString() === today.toDateString()
    } else if (dateFilter === "yesterday") {
      matchesDate = activity.timestamp.toDateString() === yesterday.toDateString()
    } else if (dateFilter === "week") {
      matchesDate = activity.timestamp >= lastWeek
    } else if (dateFilter === "month") {
      matchesDate = activity.timestamp >= lastMonth
    }

    return matchesSearch && matchesCategory && matchesDate
  })

  // Sort activities by timestamp (newest first)
  const sortedActivities = [...filteredActivities].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  // Pagination
  const indexOfLastActivity = currentPage * activitiesPerPage
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage
  const currentActivities = sortedActivities.slice(indexOfFirstActivity, indexOfLastActivity)
  const totalPages = Math.ceil(sortedActivities.length / activitiesPerPage)

  const resetFilters = () => {
    setCategoryFilter("all")
    setDateFilter("all")
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "user":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "project":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "system":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "auth":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "security":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "content":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">Track and monitor all admin activities across the platform.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search activities..."
              className="w-full rounded-lg pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {(categoryFilter !== "all" || dateFilter !== "all") && (
              <Badge className="ml-2 rounded-full px-1" variant="secondary">
                {[categoryFilter !== "all" ? 1 : 0, dateFilter !== "all" ? 1 : 0].reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="category-filter">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="category-filter" className="w-[150px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="date-filter">Date Range</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger id="date-filter" className="w-[150px]">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="sm" className="mt-auto" onClick={resetFilters}>
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="p-4">
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>{filteredActivities.length} activities found</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-8">
            {currentActivities.map((activity) => (
              <div key={activity.id} className="relative flex items-start gap-4">
                <div className="absolute left-0 top-0 bottom-0 flex w-6 justify-center">
                  <div className="w-px bg-border" />
                </div>
                <div className={`relative rounded-full p-2 ${getCategoryColor(activity.category)}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{activity.action}</p>
                    <Badge variant="outline" className="capitalize">
                      {activity.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>By: {activity.user}</span>
                    <span>Target: {activity.target}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(activity.timestamp, "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4">
          <div className="text-sm text-muted-foreground">
            Showing {indexOfFirstActivity + 1} to {Math.min(indexOfLastActivity, sortedActivities.length)} of{" "}
            {sortedActivities.length} activities
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}


