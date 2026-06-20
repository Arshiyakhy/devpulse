import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Terminal, ChevronRight, RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { OrbitalBackground } from "@/components/ui/OrbitalBackground";

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

const COLORS = ["#3fb950", "#238636", "#2ea043", "#1f6feb", "#8b5cf6", "#f59e0b"];

function formatHour(hour: string) {
  const h = parseInt(hour);
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function NumberTicker({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * value));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);
  return <span>{count}</span>;
}

function AnimatedThemeToggle({
  isDark,
  setIsDark,
}: {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
}) {
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="relative flex items-center justify-between w-16 h-8 p-1 bg-secondary border border-border rounded-full cursor-pointer transition-colors duration-300 overflow-hidden"
    >
      <div
        className={`absolute left-1 w-6 h-6 bg-primary rounded-full shadow-md transition-transform duration-500 ${
          isDark ? "translate-x-8" : "translate-x-0"
        }`}
      />
      <Sun
        className={`w-4 h-4 z-10 transition-colors duration-300 ml-1 ${
          isDark ? "text-muted-foreground" : "text-primary-foreground"
        }`}
      />
      <Moon
        className={`w-4 h-4 z-10 transition-colors duration-300 mr-1 ${
          isDark ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      />
    </button>
  );
}

interface StatCardData {
  label: string;
  value: ReactNode;
  caption?: string;
  accent: string;
}

function StatScreen({
  card,
  index,
  total,
  onAdvance,
}: {
  card: StatCardData;
  index: number;
  total: number;
  onAdvance: () => void;
}) {
  return (
    <div
      onClick={onAdvance}
      className="relative w-full max-w-2xl cursor-pointer select-none group"
    >
      <Card
        key={index}
        className="bg-card/60 backdrop-blur-xl border border-border/60 shadow-2xl shadow-black/30 overflow-hidden animate-in fade-in zoom-in-95 duration-500"
      >
        <CardContent className="py-20 px-10 text-center flex flex-col items-center gap-6">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            {card.label}
          </p>
          <p className={`text-7xl md:text-8xl font-black tracking-tighter ${card.accent}`}>
            {card.value}
          </p>
          {card.caption && (
            <p className="text-sm text-muted-foreground max-w-md">{card.caption}</p>
          )}
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mt-8 opacity-60 group-hover:opacity-100 transition-opacity">
            <span>
              {index + 1} / {total}
            </span>
            <ChevronRight className="h-4 w-4" />
            <span>tap to continue</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RecapCard({
  user,
  stats,
  totalCommits,
  peakHour,
  languageChartData,
  onReplay,
}: {
  user: User;
  stats: Stats;
  totalCommits: number;
  peakHour: string;
  languageChartData: { name: string; value: number }[];
  onReplay: () => void;
}) {
  return (
    <Card className="w-full max-w-3xl bg-card/70 backdrop-blur-xl border border-primary/30 shadow-2xl shadow-primary/10 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
      <CardContent className="p-8 md:p-10 flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-border/40 pb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/40">
              <AvatarImage src={user.avatarUrl} alt={user.username} />
              <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-lg leading-tight">{user.username}</p>
              <Badge
                variant="secondary"
                className="font-mono text-[10px] bg-primary/10 text-primary border-none px-2 py-0 mt-1"
              >
                DEVPULSE RECAP
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onReplay}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Replay
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs font-mono uppercase text-muted-foreground tracking-wider">
              Commits
            </p>
            <p className="text-3xl font-bold text-primary mt-1">{totalCommits}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-mono uppercase text-muted-foreground tracking-wider">
              Streak
            </p>
            <p className="text-3xl font-bold mt-1">
              {stats.streaks.longest}
              <span className="text-base text-muted-foreground"> d</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs font-mono uppercase text-muted-foreground tracking-wider">
              Peak Hour
            </p>
            <p className="text-3xl font-bold mt-1">{peakHour}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-mono uppercase text-muted-foreground tracking-wider">
              Top Day
            </p>
            <p className="text-2xl font-bold mt-1 truncate">{stats.streaks.mostActiveDay}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
            Language Core
          </p>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={languageChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {languageChartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
            <div className="flex flex-wrap gap-3 justify-center">
              {languageChartData.map((lang, i) => (
                <div key={lang.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="font-mono text-muted-foreground">{lang.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === null ? true : saved === "dark";
  });
  const [cardIndex, setCardIndex] = useState(0);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    fetch("http://localhost:3000/auth/me", { credentials: "include" })
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
        setCardIndex(0);
      });
  }, [user]);

  const handleLogout = async () => {
    await fetch("http://localhost:3000/auth/logout", { credentials: "include" });
    setUser(null);
    setStats(null);
    setCardIndex(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative">
        <OrbitalBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Terminal className="h-8 w-8 text-primary animate-pulse" />
          <p className="text-muted-foreground font-mono text-sm tracking-widest">
            INITIALIZING DEVPULSE...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
        <OrbitalBackground />
        <div className="absolute top-6 right-6 z-20">
          <AnimatedThemeToggle isDark={isDark} setIsDark={setIsDark} />
        </div>
        <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
          <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent mb-4">
            DevPulse
          </h1>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest mb-10">
            [ Git activity, beautifully wrapped ]
          </p>
          <Button
            size="lg"
            className="h-14 px-10 text-lg font-bold tracking-wide shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all"
            asChild
          >
            <a href="http://localhost:3000/auth/login">Login with GitHub</a>
          </Button>
        </div>
      </div>
    );
  }

  const totalCommits = stats
    ? Object.values(stats.day).reduce((sum, n) => sum + n, 0)
    : 0;

  const peakHourEntry = stats
    ? Object.entries(stats.hour).reduce(
        (max, [h, c]) => (c > max[1] ? [h, c] : max),
        ["0", 0] as [string, number]
      )
    : null;
  const peakHour = peakHourEntry ? formatHour(peakHourEntry[0]) : "--";

  const topLang =
    stats && Object.keys(stats.languages).length > 0
      ? Object.entries(stats.languages).reduce((max, [name, count]) =>
          count > max[1] ? [name, count] : max
        )[0]
      : "—";

  const languageChartData = stats
    ? Object.entries(stats.languages).map(([name, value]) => ({ name, value }))
    : [];

  const statCards: StatCardData[] = stats
    ? [
        {
          label: "Total Commits",
          value: <NumberTicker value={totalCommits} duration={1500} />,
          caption: "Across every repo, this year so far.",
          accent: "text-primary",
        },
        {
          label: "Longest Streak",
          value: `${stats.streaks.longest} days`,
          caption: "Consecutive days you shipped code.",
          accent: "text-emerald-400",
        },
        {
          label: "Most Active Day",
          value: stats.streaks.mostActiveDay,
          caption: "Your single most productive day.",
          accent: "text-violet-400",
        },
        {
          label: "Peak Coding Hour",
          value: peakHour,
          caption: "When your commits cluster the most.",
          accent: "text-amber-400",
        },
        {
          label: "Top Language",
          value: topLang,
          caption: "Your most-used language across repos.",
          accent: "text-blue-400",
        },
      ]
    : [];

  const showingRecap = !!stats && cardIndex >= statCards.length;

  const advance = () => {
    if (!stats) return;
    setCardIndex((i) => Math.min(i + 1, statCards.length));
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <OrbitalBackground />
      <div className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/40">
            <AvatarImage src={user.avatarUrl} alt={user.username} />
            <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold leading-tight">{user.username}</p>
            <p className="text-xs text-muted-foreground font-mono tracking-wider leading-tight">
              DEVPULSE
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <AnimatedThemeToggle isDark={isDark} setIsDark={setIsDark} />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-10 min-h-[calc(100vh-100px)]">
        {statsLoading && (
          <div className="flex items-center gap-3 text-primary font-mono text-sm">
            <Terminal className="h-5 w-5 animate-spin" />
            <span>Crunching your commits...</span>
          </div>
        )}

        {stats && !showingRecap && statCards[cardIndex] && (
          <StatScreen
            card={statCards[cardIndex]}
            index={cardIndex}
            total={statCards.length}
            onAdvance={advance}
          />
        )}

        {stats && showingRecap && (
          <RecapCard
            user={user}
            stats={stats}
            totalCommits={totalCommits}
            peakHour={peakHour}
            languageChartData={languageChartData}
            onReplay={() => setCardIndex(0)}
          />
        )}
      </div>
    </div>
  );
}

export default App;