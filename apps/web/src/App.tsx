import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

interface User {
  githubId: number;
  username: string;
  avatarUrl: string;
}

interface Stats {
  day: Record<string, number>;
  hour: Record<string, number>;
  languages: Record<string, number>;
  streaks: {
    longest: number;
    mostActiveDay: string;
  };
}

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/auth/me", {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not logged in");
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!user) return;

    setStatsLoading(true);
    fetch("http://localhost:3000/api/commits", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setStatsLoading(false);
      });
  }, [user]);

  const handleLogout = async () => {
    await fetch("http://localhost:3000/auth/logout", {
      credentials: "include",
    });
    setUser(null);
    setStats(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <h1 className="text-5xl font-bold tracking-tight">DevPulse</h1>
        <p className="text-muted-foreground max-w-sm text-center">
          Your GitHub activity, wrapped. Weekly and monthly insights into how
          you code.
        </p>
        <Button size="lg" asChild>
          <a href="http://localhost:3000/auth/login">Login with GitHub</a>
        </Button>
      </div>
    );
  }

  const totalCommits = stats
    ? Object.values(stats.day).reduce((sum, n) => sum + n, 0)
    : 0;

  const dayChartData = stats
    ? Object.entries(stats.day).map(([day, count]) => ({
        day: day.slice(0, 3),
        commits: count,
      }))
    : [];

  const languageChartData = stats
    ? Object.entries(stats.languages).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const peakHour = stats
    ? Object.entries(stats.hour).reduce((max, [hour, count]) =>
        count > max[1] ? [hour, count] : max,
      )
    : null;

  const formatHour = (hour: string) => {
    const h = parseInt(hour);
    if (h === 0) return "12 AM";
    if (h === 12) return "12 PM";
    return h < 12 ? `${h} AM` : `${h - 12} PM`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.avatarUrl} alt={user.username} />
              <AvatarFallback>{user.username[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold leading-tight">{user.username}</p>
              <p className="text-sm text-muted-foreground leading-tight">
                DevPulse
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {statsLoading && (
          <p className="text-muted-foreground">Crunching your commits...</p>
        )}

        {stats && (
          <div className="flex flex-col gap-6">
            {/* Hero stat */}
            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="py-10 text-center">
                <p className="text-sm uppercase tracking-wide opacity-80 mb-2">
                  Total Commits
                </p>
                <p className="text-7xl font-bold tabular-nums">
                  {totalCommits}
                </p>
              </CardContent>
            </Card>

            {/* Stat grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    Longest Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {stats.streaks.longest}{" "}
                    <span className="text-base font-normal text-muted-foreground">
                      days
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    Most Active Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {stats.streaks.mostActiveDay}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    Peak Coding Hour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {peakHour ? formatHour(peakHour[0]) : "--"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Commits by day chart */}
            <Card>
              <CardHeader>
                <CardTitle>Commits by Day of Week</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dayChartData}>
                    <XAxis
                      dataKey="day"
                      stroke="currentColor"
                      className="text-xs text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                      }}
                    />
                    <Bar
                      dataKey="commits"
                      fill="#6366f1"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Language breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={languageChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {languageChartData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {languageChartData.map((lang, index) => (
                      <Badge
                        key={lang.name}
                        variant="secondary"
                        style={{
                          backgroundColor: `${COLORS[index % COLORS.length]}20`,
                          color: COLORS[index % COLORS.length],
                        }}
                      >
                        {lang.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;