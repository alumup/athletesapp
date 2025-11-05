"use client";

import { motion } from "framer-motion";
import { Users, Mail, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

interface DashboardClientProps {
  profile: any;
  stats: {
    totalTeams: number;
    totalPeople: number;
    totalEmailsSent: number;
    recentActivity: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
      teamName?: string;
    }>;
  };
}

export function DashboardClient({ profile, stats }: DashboardClientProps) {
  const router = useRouter();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {profile?.first_name || profile?.email}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your teams
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/teams")}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          View Teams
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeams}</div>
              <p className="text-xs text-muted-foreground">
                Managing {stats.totalPeople} people
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPeople}</div>
              <p className="text-xs text-muted-foreground">
                Players and staff combined
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Emails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmailsSent}</div>
              <p className="text-xs text-muted-foreground">
                Sent in the last 30 days
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/placeholder.png" alt="Avatar" />
                      <AvatarFallback>
                        {activity.type === "team_stats"
                          ? activity.teamName?.substring(0, 2).toUpperCase()
                          : activity.type === "email_sent"
                            ? "EM"
                            : "AC"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

