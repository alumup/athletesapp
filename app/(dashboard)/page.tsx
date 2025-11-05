import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAccount } from "@/lib/fetchers/server";
import { DashboardClient } from "./dashboard-client";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const account = await getAccount();

  // Fetch teams with roster counts server-side
  const { data: teamStats } = await supabase
    .from("teams")
    .select(
      `
        id,
        name,
        created_at,
        rosters (
          id,
          people (
            first_name,
            last_name
          )
        ),
        staff (
          id,
          people (
            first_name,
            last_name
          )
        )
      `,
    )
    .eq("account_id", account.id)
    .eq("is_active", true);

  // Fetch recent emails server-side
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: emailStats } = await supabase
    .from("emails")
    .select("id, subject, created_at")
    .eq("account_id", account.id)
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: false });

  // Get recent activity
  const recentActivity = [
    ...(teamStats?.map((team) => ({
      id: team.id,
      type: "team_stats",
      description: `Team "${team.name}" has ${team.rosters?.length || 0} players and ${team.staff?.length || 0} staff members`,
      timestamp: team.created_at,
      teamName: team.name,
    })) || []),
    ...(emailStats
      ?.slice(0, 5)
      .map((email) => ({
        id: email.id,
        type: "email_sent",
        description: `Email sent: ${email.subject}`,
        timestamp: email.created_at,
      })) || []),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 5);

  // Calculate totals
  const totalTeams = teamStats?.length || 0;
  const totalRosterSpots =
    teamStats?.reduce((acc, team) => acc + (team.rosters?.length || 0), 0) || 0;
  const totalStaff =
    teamStats?.reduce((acc, team) => acc + (team.staff?.length || 0), 0) || 0;
  const totalEmailsSent = emailStats?.length || 0;

  const stats = {
    totalTeams,
    totalPeople: totalRosterSpots + totalStaff,
    totalEmailsSent,
    recentActivity,
  };

  const profile = {
    first_name: account.name,
    email: user.email,
  };

  return <DashboardClient profile={profile} stats={stats} />;
}