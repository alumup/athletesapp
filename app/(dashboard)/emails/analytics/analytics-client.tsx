"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Mail,
  CheckCircle,
  Eye,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Radio,
  List,
} from "lucide-react"
import Link from "next/link"

interface EmailAnalyticsClientProps {
  account: any
  analytics30Days: any
  analytics7Days: any
  analyticsAllTime: any
  recentEmails: any[]
  broadcasts: any[]
  lists: any[]
}

export default function EmailAnalyticsClient({
  account,
  analytics30Days,
  analytics7Days,
  analyticsAllTime,
  recentEmails,
  broadcasts,
  lists,
}: EmailAnalyticsClientProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (email: any) => {
    if (email.clicked_at) {
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          <MousePointerClick className="mr-1 h-3 w-3" />
          Clicked ({email.click_count})
        </Badge>
      )
    }
    if (email.opened_at) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Eye className="mr-1 h-3 w-3" />
          Opened
        </Badge>
      )
    }
    if (email.delivered_at) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" />
          Delivered
        </Badge>
      )
    }
    if (email.status === "sent") {
      return (
        <Badge variant="outline" className="bg-gray-100">
          <Mail className="mr-1 h-3 w-3" />
          Sent
        </Badge>
      )
    }
    if (email.status === "bounced") {
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" />
          Bounced
        </Badge>
      )
    }
    return <Badge variant="outline">{email.status}</Badge>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Email Analytics
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your email performance
            </p>
          </div>
          <Link href="/emails">
            <Badge variant="outline" className="cursor-pointer">
              ← Back to Emails
            </Badge>
          </Link>
        </div>
      </div>

      {/* Time Period Tabs */}
      <Tabs defaultValue="30days" className="space-y-6">
        <TabsList>
          <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
          <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
          <TabsTrigger value="alltime">All Time</TabsTrigger>
        </TabsList>

        {[
          { value: "7days", data: analytics7Days, label: "7 days" },
          { value: "30days", data: analytics30Days, label: "30 days" },
          { value: "alltime", data: analyticsAllTime, label: "all time" },
        ].map(({ value, data, label }) => (
          <TabsContent key={value} value={value} className="space-y-6">
            {/* Core Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Sent
                  </CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data?.total_sent?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    in the last {label}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Delivery Rate
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {data?.delivery_rate || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data?.total_delivered?.toLocaleString() || 0} delivered
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Open Rate
                  </CardTitle>
                  <Eye className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {data?.open_rate || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data?.total_opened?.toLocaleString() || 0} opened
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Click Rate
                  </CardTitle>
                  <MousePointerClick className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {data?.click_rate || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data?.total_clicked?.toLocaleString() || 0} clicked
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Bounce Rate
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {data?.bounce_rate || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data?.total_bounced?.toLocaleString() || 0} bounced
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Additional Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Broadcasts Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Broadcast Campaigns</CardTitle>
            </div>
            <CardDescription>
              Performance of your newsletter campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Campaigns
                </span>
                <span className="text-2xl font-bold">{broadcasts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sent</span>
                <span className="text-lg font-medium">
                  {broadcasts.filter((b) => b.status === "sent").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Recipients
                </span>
                <span className="text-lg font-medium">
                  {broadcasts
                    .reduce((acc, b) => acc + (b.total_sent || 0), 0)
                    .toLocaleString()}
                </span>
              </div>
              <Link href="/emails/broadcasts">
                <Badge variant="outline" className="w-full justify-center cursor-pointer mt-4">
                  View All Broadcasts →
                </Badge>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Lists Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <List className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Email Lists</CardTitle>
            </div>
            <CardDescription>Your segmented audiences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Lists
                </span>
                <span className="text-2xl font-bold">{lists.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Synced to Resend
                </span>
                <span className="text-lg font-medium">
                  {lists.filter((l) => l.resend_segment_id).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Members
                </span>
                <span className="text-lg font-medium">
                  {lists
                    .reduce(
                      (acc, list) => acc + (list.list_people?.[0]?.count || 0),
                      0
                    )
                    .toLocaleString()}
                </span>
              </div>
              <Link href="/emails/lists">
                <Badge variant="outline" className="w-full justify-center cursor-pointer mt-4">
                  Manage Lists →
                </Badge>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Email Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Email Activity</CardTitle>
          <CardDescription>
            Last 50 emails sent from your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Opened</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEmails.length > 0 ? (
                  recentEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">
                        {email.subject}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {email.recipient?.first_name}{" "}
                            {email.recipient?.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {email.recipient?.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(email)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(email.sent_at)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {email.opened_at ? formatDate(email.opened_at) : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No emails found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

