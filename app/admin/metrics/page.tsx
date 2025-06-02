"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Download,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  MessageSquareCode,
  FileCode2,
  Users,
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"

// Mock data for charts
const dailyUsageData = [
  { name: "Mon", prompts: 4000, completions: 3800 },
  { name: "Tue", prompts: 3000, completions: 2850 },
  { name: "Wed", prompts: 5000, completions: 4750 },
  { name: "Thu", prompts: 2780, completions: 2640 },
  { name: "Fri", prompts: 1890, completions: 1795 },
  { name: "Sat", prompts: 2390, completions: 2270 },
  { name: "Sun", prompts: 3490, completions: 3315 },
]

const monthlyUsageData = [
  { name: "Jan", prompts: 12000, completions: 11400 },
  { name: "Feb", prompts: 15000, completions: 14250 },
  { name: "Mar", prompts: 18000, completions: 17100 },
  { name: "Apr", prompts: 16000, completions: 15200 },
  { name: "May", prompts: 21000, completions: 19950 },
  { name: "Jun", prompts: 25000, completions: 23750 },
  { name: "Jul", prompts: 23000, completions: 21850 },
  { name: "Aug", prompts: 27000, completions: 25650 },
  { name: "Sep", prompts: 30000, completions: 28500 },
  { name: "Oct", prompts: 29000, completions: 27550 },
  { name: "Nov", prompts: 32000, completions: 30400 },
  { name: "Dec", prompts: 35000, completions: 33250 },
]

const usageByUserTypeData = [
  { name: "Free Users", value: 65 },
  { name: "Premium Users", value: 35 },
]

const usageByFeatureData = [
  { name: "Code Generation", value: 40 },
  { name: "Code Explanation", value: 25 },
  { name: "Debugging", value: 20 },
  { name: "Optimization", value: 15 },
]

const topUsersData = [
  { id: "1", name: "John Doe", email: "john@example.com", prompts: 1250, completions: 1187, avgResponseTime: 1.2 },
  { id: "2", name: "Jane Smith", email: "jane@example.com", prompts: 980, completions: 931, avgResponseTime: 1.5 },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", prompts: 850, completions: 807, avgResponseTime: 1.3 },
  { id: "4", name: "Alice Williams", email: "alice@example.com", prompts: 720, completions: 684, avgResponseTime: 1.1 },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    prompts: 650,
    completions: 617,
    avgResponseTime: 1.4,
  },
]

const COLORS = ["#4ade80", "#60a5fa", "#f97316", "#a78bfa", "#f43f5e"]

export default function AIUsageMetrics() {
  const [searchQuery, setSearchQuery] = useState("")
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>("7d")
  const [featureFilter, setFeatureFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Pagination for top users
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = topUsersData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(topUsersData.length / itemsPerPage)

  const resetFilters = () => {
    setTimeRangeFilter("7d")
    setFeatureFilter("all")
  }

  const getTimeRangeLabel = () => {
    switch (timeRangeFilter) {
      case "24h":
        return "Last 24 Hours"
      case "7d":
        return "Last 7 Days"
      case "30d":
        return "Last 30 Days"
      case "90d":
        return "Last 90 Days"
      case "1y":
        return "Last Year"
      default:
        return "Last 7 Days"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Usage Metrics</h1>
        <p className="text-muted-foreground">Monitor and analyze AI usage patterns across the platform.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search metrics..."
              className="w-full rounded-lg pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {(timeRangeFilter !== "7d" || featureFilter !== "all") && (
              <Badge className="ml-2 rounded-full px-1" variant="secondary">
                {[timeRangeFilter !== "7d" ? 1 : 0, featureFilter !== "all" ? 1 : 0].reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="time-range-filter">Time Range</Label>
                <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
                  <SelectTrigger id="time-range-filter" className="w-[150px]">
                    <SelectValue placeholder="Filter by time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                    <SelectItem value="1y">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="feature-filter">Feature</Label>
                <Select value={featureFilter} onValueChange={setFeatureFilter}>
                  <SelectTrigger id="feature-filter" className="w-[150px]">
                    <SelectValue placeholder="Filter by feature" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Features</SelectItem>
                    <SelectItem value="code-gen">Code Generation</SelectItem>
                    <SelectItem value="code-explain">Code Explanation</SelectItem>
                    <SelectItem value="debug">Debugging</SelectItem>
                    <SelectItem value="optimize">Optimization</SelectItem>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <MessageSquareCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28,592</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+18.7%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completions</CardTitle>
            <FileCode2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27,162</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+16.2%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.3s</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowDownRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">-0.2s</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,842</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+12.3%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily">Daily Usage</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          <TabsTrigger value="users">User Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Usage Overview</CardTitle>
              <CardDescription>{getTimeRangeLabel()}</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyUsageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrompts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="prompts"
                    stroke="#4ade80"
                    fillOpacity={1}
                    fill="url(#colorPrompts)"
                    name="Prompts"
                  />
                  <Area
                    type="monotone"
                    dataKey="completions"
                    stroke="#60a5fa"
                    fillOpacity={1}
                    fill="url(#colorCompletions)"
                    name="Completions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Usage by User Type</CardTitle>
                <CardDescription>Free vs Premium users</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={usageByUserTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => ${name} ${(percent * 100).toFixed(0)}%}
                    >
                      {usageByUserTypeData.map((entry, index) => (
                        <Cell key={cell-${index}} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Usage by Feature</CardTitle>
                <CardDescription>Distribution across features</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={usageByFeatureData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => ${name} ${(percent * 100).toFixed(0)}%}
                    >
                      {usageByFeatureData.map((entry, index) => (
                        <Cell key={cell-${index}} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Users by AI Usage</CardTitle>
              <CardDescription>Users with highest AI prompt usage</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Prompts</TableHead>
                    <TableHead>Completions</TableHead>
                    <TableHead>Avg. Response Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.prompts.toLocaleString()}</TableCell>
                      <TableCell>{user.completions.toLocaleString()}</TableCell>
                      <TableCell>{user.avgResponseTime}s</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, topUsersData.length)} of{" "}
                {topUsersData.length} users
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
        </TabsContent>
        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily AI Usage</CardTitle>
              <CardDescription>Prompts and completions by day</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyUsageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="prompts" fill="#4ade80" name="Prompts" />
                  <Bar dataKey="completions" fill="#60a5fa" name="Completions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly AI Usage Trends</CardTitle>
              <CardDescription>Prompts and completions by month</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyUsageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="prompts" stroke="#4ade80" activeDot={{ r: 8 }} name="Prompts" />
                  <Line type="monotone" dataKey="completions" stroke="#60a5fa" name="Completions" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User AI Usage Analysis</CardTitle>
              <CardDescription>Detailed breakdown by user type</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Free Users", prompts: 18584, completions: 17654 },
                    { name: "Premium Users", prompts: 10008, completions: 9508 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="prompts" fill="#4ade80" name="Prompts" />
                  <Bar dataKey="completions" fill="#60a5fa" name="Completions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
