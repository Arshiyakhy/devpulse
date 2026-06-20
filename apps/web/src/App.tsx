import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Terminal, ChevronRight, RotateCcw, Download, Share2, Copy, Share } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { OrbitalBackground } from "@/components/ui/OrbitalBackground";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { SparklesCore } from "@/components/ui/sparkles";

// ---------------- Personality classification ----------------
// Pure rule-based logic — no AI call needed for this part.

function getPersonality(stats: Stats, totalCommits: number, peakHourNum: number) {
  const weekendCommits = (stats.day["Saturday"] ?? 0) + (stats.day["Sunday"] ?? 0);
  const weekendRatio = totalCommits > 0 ? weekendCommits / totalCommits : 0;

  if (peakHourNum >= 22 || peakHourNum < 5) {
    return { title: "Night Owl", emoji: "🦉", desc: "Most of your commits land after dark." };
  }
  if (peakHourNum >= 5 && peakHourNum < 9) {
    return { title: "Early Bird", emoji: "🌅", desc: "You're shipping code before most people wake up." };
  }
  if (weekendRatio > 0.35) {
    return { title: "Weekend Warrior", emoji: "⚔️", desc: "Weekends are when you really lock in." };
  }
  if (stats.streaks.longest >= 7) {
    return { title: "Consistency Machine", emoji: "🔥", desc: "You show up, day after day." };
  }
  return { title: "Steady Shipper", emoji: "🚀", desc: "Reliable, focused, and always building." };
}

// ---------------- Activity clock (24h radial view) ----------------

function ActivityClock({ hourStats }: { hourStats: Record<string, number> }) {
  const cx = 140,
    cy = 140,
    innerR = 52,
    maxBarLen = 70;
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    commits: hourStats[String(i)] ?? 0,
  }));
  const maxCommits = Math.max(...hours.map((h) => h.commits), 1);
  const peak = hours.reduce((m, h) => (h.commits > m.commits ? h : m), hours[0]);

  const cardinals = [
    { label: "12 AM", angle: -Math.PI / 2 },
    { label: "6 AM", angle: 0 },
    { label: "12 PM", angle: Math.PI / 2 },
    { label: "6 PM", angle: Math.PI },
  ];

  return (
    <div className="flex items-center justify-center h-[300px] w-full">
      <svg width="280" height="280" viewBox="0 0 280 280">
        <defs>
          <filter id="peak-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={cx}
          cy={cy}
          r={innerR + maxBarLen + 2}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
          strokeDasharray="2 5"
        />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {cardinals.map(({ label, angle }) => {
          const r = innerR + maxBarLen + 20;
          return (
            <text
              key={label}
              x={cx + r * Math.cos(angle)}
              y={cy + r * Math.sin(angle) + 4}
              textAnchor="middle"
              fontSize="9"
              fontFamily="monospace"
              fill="var(--muted-foreground)"
              opacity="0.6"
            >
              {label}
            </text>
          );
        })}

        {hours.map(({ hour, commits }) => {
          const angle = (hour / 24) * 2 * Math.PI - Math.PI / 2;
          const barLen = commits === 0 ? 3 : Math.max(7, (commits / maxCommits) * maxBarLen);
          const isPeak = hour === peak.hour;
          const x1 = cx + innerR * Math.cos(angle);
          const y1 = cy + innerR * Math.sin(angle);
          const x2 = cx + (innerR + barLen) * Math.cos(angle);
          const y2 = cy + (innerR + barLen) * Math.sin(angle);
          const opacity = commits === 0 ? 0.12 : isPeak ? 1 : 0.35 + (commits / maxCommits) * 0.5;

          return (
            <line
              key={hour}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth={isPeak ? 5 : 3.5}
              stroke="var(--primary)"
              strokeOpacity={opacity}
              strokeLinecap="round"
              filter={isPeak ? "url(#peak-glow)" : undefined}
            />
          );
        })}

        <circle cx={cx} cy={cy} r={40} style={{ fill: "color-mix(in oklch, var(--card) 85%, transparent)" }} />
        <circle cx={cx} cy={cy} r={40} fill="none" stroke="var(--primary)" strokeOpacity="0.2" strokeWidth="1" />
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fontFamily="monospace"
          fill="var(--primary)"
        >
          {formatHour(String(peak.hour))}
        </text>
        <text
          x={cx}
          y={cy + 13}
          textAnchor="middle"
          fontSize="7.5"
          fontFamily="monospace"
          fill="var(--muted-foreground)"
          opacity="0.6"
          letterSpacing="1.5"
        >
          PEAK HOUR
        </text>
      </svg>
    </div>
  );
}

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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
  visual?: ReactNode; // optional custom content below the value (e.g. the clock)
  element: "fire" | "earthquake" | "wind" | "flood";
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
    <motion.div
      key={index}
      initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      exit={{ opacity: 0, scale: 0.9, rotateX: 10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-2xl"
    >
      <CardContainer className="w-full" containerClassName="py-0">
        <CardBody className="relative w-full h-auto bg-card/60 backdrop-blur-xl border border-border/60 shadow-2xl shadow-black/30 rounded-2xl">
          <CardItem translateZ={40} className="w-full">
            <div
              onClick={onAdvance}
              className="cursor-pointer select-none group py-16 px-10 text-center flex flex-col items-center gap-4"
            >
              <CardItem translateZ={60} className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                {card.label}
              </CardItem>
              <CardItem
                translateZ={90}
                className={`text-6xl md:text-7xl font-black tracking-tighter ${card.accent}`}
              >
                {card.value}
              </CardItem>
              {card.caption && (
                <CardItem translateZ={50} className="text-sm text-muted-foreground max-w-md">
                  {card.caption}
                </CardItem>
              )}
              {card.visual && (
                <CardItem translateZ={40} className="w-full mt-2">
                  {card.visual}
                </CardItem>
              )}
              <CardItem
                translateZ={30}
                className="flex items-center gap-2 text-xs font-mono text-muted-foreground mt-6 opacity-60 group-hover:opacity-100 transition-opacity"
              >
                <span>
                  {index + 1} / {total}
                </span>
                <ChevronRight className="h-4 w-4" />
                <span>tap to continue</span>
              </CardItem>
            </div>
          </CardItem>
        </CardBody>
      </CardContainer>
    </motion.div>
  );
}

function RecapCard({
  user,
  stats,
  totalCommits,
  peakHour,
  languageChartData,
  personality,
  onReplay,
}: {
  user: User;
  stats: Stats;
  totalCommits: number;
  peakHour: string;
  languageChartData: { name: string; value: number }[];
  personality: { title: string; emoji: string; desc: string };
  onReplay: () => void;
}) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const shareText = `I made ${totalCommits} commits and I'm a ${personality.emoji} ${personality.title} according to DevPulse, my GitHub year in review.`;

  const captureImage = async (): Promise<string | null> => {
    if (!captureRef.current) return null;
    return toPng(captureRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor:
        getComputedStyle(document.documentElement).getPropertyValue("--background") || "#000",
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const dataUrl = await captureImage();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `devpulse-${user.username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export image:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    try {
      const dataUrl = await captureImage();
      if (!dataUrl) return;
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `devpulse-${user.username}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My DevPulse Recap",
          text: shareText,
        });
      } else {
        // fallback for browsers without native share support
        handleDownload();
      }
    } catch (err) {
      // user cancelling the share sheet also throws — ignore that case
      if ((err as Error)?.name !== "AbortError") {
        console.error("Share failed:", err);
      }
    }
  };

  const handleCopyImage = async () => {
    setCopying(true);
    try {
      const dataUrl = await captureImage();
      if (!dataUrl) return;
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    } finally {
      setCopying(false);
    }
  };

  const handleShareX = () => {
    const url = new URL("https://twitter.com/intent/tweet");
    url.searchParams.set("text", shareText);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative z-0 w-full max-w-3xl flex flex-col items-center">
      {/* Sparkles layer sits behind the card */}
      <div className="absolute inset-0 -z-10 scale-110">
        <SparklesCore
          id="recap-sparkles"
          background="transparent"
          minSize={0.5}
          maxSize={1.4}
          particleDensity={60}
          className="w-full h-full"
          particleColor="var(--primary)"
        />
      </div>

      <CardContainer containerClassName="py-0">
        <CardBody className="w-full bg-card/80 backdrop-blur-xl border border-primary/30 shadow-2xl shadow-primary/10 rounded-2xl">
          <CardItem translateZ={30} className="w-full">
            <div ref={captureRef} className="p-8 md:p-10 flex flex-col gap-8 bg-card rounded-2xl">
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
                      {personality.emoji} {personality.title.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs font-mono text-muted-foreground tracking-widest">
                  DEVPULSE
                </p>
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
            </div>
          </CardItem>
        </CardBody>
      </CardContainer>

      <div className="relative z-30 flex flex-wrap items-center justify-center gap-3 mt-10">
        <Button variant="outline" onClick={onReplay}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Replay
        </Button>
        <Button variant="outline" onClick={handleShareX}>
          <Share2 className="h-4 w-4 mr-2" />
          Share on X
        </Button>
        <Button variant="outline" onClick={handleCopyImage} disabled={copying}>
          <Copy className="h-4 w-4 mr-2" />
          {copyDone ? "Copied!" : copying ? "Copying..." : "Copy Image"}
        </Button>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <Button variant="outline" onClick={handleNativeShare}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
        <Button onClick={handleDownload} disabled={downloading}>
          <Download className="h-4 w-4 mr-2" />
          {downloading ? "Saving..." : "Download Image"}
        </Button>
      </div>
    </div>
  );
}

function AppContent() {
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
    fetch(`${API_URL}/auth/me`, { credentials: "include" })
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
    fetch(`${API_URL}/api/commits`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setStatsLoading(false);
        setCardIndex(0);
      });
  }, [user]);

  const handleLogout = async () => {
    await fetch(`${API_URL}/auth/logout`, { credentials: "include" });
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
            <a href={`${API_URL}/auth/login`}>Login with GitHub</a>
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

  const peakHourNum = peakHourEntry ? parseInt(peakHourEntry[0]) : 0;
  const personality = stats ? getPersonality(stats, totalCommits, peakHourNum) : null;

  const statCards: StatCardData[] = stats
    ? [
        {
          label: "Total Commits",
          value: <NumberTicker value={totalCommits} duration={1500} />,
          caption: "Across every repo, this year so far.",
          accent: "text-primary",
          element: "fire",
        },
        {
          label: "Longest Streak",
          value: `${stats.streaks.longest} days`,
          caption: "Consecutive days you shipped code.",
          accent: "text-emerald-400",
          element: "earthquake",
        },
        {
          label: "Most Active Day",
          value: stats.streaks.mostActiveDay,
          caption: "Your single most productive day.",
          accent: "text-violet-400",
          element: "wind",
        },
        {
          label: "Your Coding Clock",
          value: peakHour,
          caption: "When your commits cluster across the day.",
          accent: "text-amber-400",
          visual: <ActivityClock hourStats={stats.hour} />,
          element: "flood",
        },
        {
          label: "Top Language",
          value: topLang,
          caption: "Your most-used language across repos.",
          accent: "text-blue-400",
          element: "wind",
        },
        {
          label: "You Are A",
          value: (
            <span>
              {personality!.emoji} {personality!.title}
            </span>
          ),
          caption: personality!.desc,
          accent: "text-pink-400",
          element: "fire",
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
          <AnimatePresence mode="wait">
            <StatScreen
              key={cardIndex}
              card={statCards[cardIndex]}
              index={cardIndex}
              total={statCards.length}
              onAdvance={advance}
            />
          </AnimatePresence>
        )}

        {stats && showingRecap && personality && (
          <RecapCard
            user={user}
            stats={stats}
            totalCommits={totalCommits}
            peakHour={peakHour}
            languageChartData={languageChartData}
            personality={personality}
            onReplay={() => setCardIndex(0)}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;