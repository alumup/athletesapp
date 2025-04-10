'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { 
  Users,
  Mail,
  Calendar,
  ArrowUpRight,
  Bell,
  Settings
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import { Button } from "@/components/ui/button"

interface DashboardStats {
  totalTeams: number
  totalPeople: number
  totalEmailsSent: number
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    teamName?: string
    personName?: string
  }>
}

interface Profile {
  id: string
  account_id: string
  first_name?: string
  last_name?: string
  email?: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalTeams: 0,
    totalPeople: 0,
    totalEmailsSent: 0,
    recentActivity: []
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Get user's profile to get account_id
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(profileData)
        
        if (profileData?.account_id) {
          fetchDashboardStats(profileData.account_id)
        }
      }
    }

    getUser()
  }, [supabase.auth])

  const fetchDashboardStats = async (accountId: string) => {
    // Fetch teams with roster counts
    const { data: teamStats, error: teamsError } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        created_at,
        rosters!team_id (
          id,
          person:person_id (
            first_name,
            last_name
          )
        ),
        staff!team_id (
          id,
          person:person_id (
            first_name,
            last_name
          )
        )
      `)
      .eq('account_id', accountId)
      .eq('is_active', true)

    if (teamsError) console.error('Error fetching teams:', teamsError)

    // Fetch recent emails
    const { data: emailStats, error: emailError } = await supabase
      .from('emails')
      .select('id, subject, created_at')
      .eq('account_id', accountId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('created_at', { ascending: false })

    if (emailError) console.error('Error fetching emails:', emailError)

    // Get recent activity
    const recentActivity = [
      ...(teamStats?.map(team => ({
        id: team.id,
        type: 'team_stats',
        description: `Team "${team.name}" has ${team.rosters?.length || 0} players and ${team.staff?.length || 0} staff members`,
        timestamp: team.created_at,
        teamName: team.name
      })) || []),
      ...(emailStats?.slice(0, 5).map(email => ({
        id: email.id,
        type: 'email_sent',
        description: `Email sent: ${email.subject}`,
        timestamp: email.created_at,
        emailSubject: email.subject
      })) || [])
    ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

    // Calculate totals
    const totalTeams = teamStats?.length || 0
    const totalRosterSpots = teamStats?.reduce((acc, team) => acc + (team.rosters?.length || 0), 0) || 0
    const totalStaff = teamStats?.reduce((acc, team) => acc + (team.staff?.length || 0), 0) || 0
    const totalEmailsSent = emailStats?.length || 0

    setStats({
      totalTeams,
      totalPeople: totalRosterSpots + totalStaff,
      totalEmailsSent,
      recentActivity
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {profile?.first_name || user?.email}
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your teams</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => router.push('/teams')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          View Teams
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder-avatar.png" alt="Avatar" />
                    <AvatarFallback>
                      {activity.type === 'team_stats' 
                        ? activity.teamName?.substring(0, 2).toUpperCase()
                        : activity.type === 'email_sent'
                          ? 'EM'
                          : 'AC'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}