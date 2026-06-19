import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Moon, Sun, GitBranch, Code, Terminal, GitPullRequest, 
  GitCommit, Braces, Database, Cpu, Command 
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// --- 1. PREMIUM CSS INJECTION ---
const StyleInject = () => (
  <style dangerouslySetInnerHTML={{__html: `
    /* Orbital Animations for Login */
    @keyframes orbit-cw {
      0% { transform: rotate(0deg) translateX(var(--radius)) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(var(--radius)) rotate(-360deg); }
    }
    @keyframes orbit-ccw {
      0% { transform: rotate(360deg) translateX(var(--radius)) rotate(-360deg); }
      100% { transform: rotate(0deg) translateX(var(--radius)) rotate(0deg); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    .glass-card {
      background: rgba(var(--card), 0.6);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* 3D Isometric City CSS */
    .iso-grid {
      transform: rotateX(60deg) rotateZ(-45deg);
      transform-style: preserve-3d;
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 12px;
    }
    .iso-pillar {
      width: 20px;
      height: 20px;
      background: rgba(var(--primary), 0.05);
      transform-style: preserve-3d;
      transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .iso-pillar-top {
      position: absolute;
      width: 100%;
      height: 100%;
      background: rgba(var(--primary), 0.9);
      border: 1px solid rgba(255,255,255,0.3);
      transform: translateZ(var(--height));
      box-shadow: 0 0 20px rgba(var(--primary), 0.4);
      transition: all 0.5s ease;
    }
    .iso-pillar-left {
      position: absolute;
      width: 100%;
      height: var(--height);
      background: rgba(var(--primary), 0.6);
      transform: rotateX(-90deg) translateZ(-20px);
      transform-origin: bottom;
      transition: all 0.5s ease;
    }
    .iso-pillar-right {
      position: absolute;
      width: var(--height);
      height: 100%;
      background: rgba(var(--primary), 0.3);
      transform: rotateY(90deg) translateZ(0);
      transform-origin: right;
      transition: all 0.5s ease;
    }
    .iso-pillar:hover .iso-pillar-top { background: rgba(var(--primary), 1); box-shadow: 0 0 30px rgba(var(--primary), 0.8); }
  `}} />
);

// --- 2. COMPONENTS ---

function NumberTicker({ value, duration = 1500 }: { value: number, duration?: number }) {
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

function AnimatedThemeToggle({ isDark, setIsDark }: { isDark: boolean, setIsDark: (val: boolean) => void }) {
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="relative flex items-center justify-between w-16 h-8 p-1 bg-secondary border border-border rounded-full cursor-pointer transition-colors duration-300 overflow-hidden"
    >
      <div className={`absolute left-1 w-6 h-6 bg-primary rounded-full shadow-md transition-transform duration-500 cubic-bezier(0.68, -0.55, 0.265, 1.55) ${isDark ? 'translate-x-8' : 'translate-x-0'}`} />
      <Sun className={`w-4 h-4 z-10 transition-colors duration-300 ml-1 ${isDark ? 'text-muted-foreground' : 'text-primary-foreground'}`} />
      <Moon className={`w-4 h-4 z-10 transition-colors duration-300 mr-1 ${isDark ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
    </button>
  );
}

function CustomGitHubIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

// --- 3. WIDGETS ---

function StatDeck({ stats, peakHour }: { stats: any, peakHour: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const deck = [
    { id: "streak", title: "Longest Streak", value: `${stats.streaks.longest} days`, glow: "shadow-emerald-500/20", accent: "text-emerald-400" },
    { id: "active", title: "Most Active Day", value: stats.streaks.mostActiveDay, glow: "shadow-primary/20", accent: "text-primary" },
    { id: "peak", title: "Peak Coding Hour", value: peakHour, glow: "shadow-violet-500/20", accent: "text-violet-400" },
  ];

  return (
    <div className="relative h-48 w-full cursor-pointer perspective-1000 group" onClick={() => setActiveIndex((prev) => (prev + 1) % deck.length)}>
      {deck.map((card, index) => {
        const offset = (index - activeIndex + deck.length) % deck.length;
        return (
          <Card
            key={card.id}
            className={`absolute top-0 left-0 w-full glass-card transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] border border-border/40 ${
              offset === 0 ? `z-30 translate-y-0 scale-100 opacity-100 hover:shadow-2xl hover:-translate-y-2 ${card.glow}` : 
              offset === 1 ? "z-20 translate-y-6 scale-95 opacity-60" : 
              "z-10 translate-y-12 scale-90 opacity-20"
            }`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-4xl md:text-5xl font-bold tracking-tight ${card.accent}`}>{card.value}</p>
              <p className="text-[10px] text-muted-foreground mt-6 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                [ Click to cycle deck ]
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function IsometricCity({ dailyStats }: { dailyStats: Record<string, number> }) {
  const values = Object.values(dailyStats);
  const days = values.length > 28 ? values.slice(-28) : [...Array(28 - values.length).fill(0), ...values];
  const maxCommits = Math.max(...days, 1);

  return (
    <div className="flex justify-center items-center h-[300px] w-full perspective-[1000px] overflow-hidden">
      <div className="iso-grid">
        {days.map((commits, index) => {
          const height = commits === 0 ? 4 : (commits / maxCommits) * 100;
          
          return (
            <div key={index} className="iso-pillar">
              <div 
                className="iso-pillar-top" 
                style={{ transform: `translateZ(${height}px)` }}
              />
              {/* Left and Right faces stay static for the 3D depth illusion */}
              <div 
                className="absolute w-full bg-primary/40 bottom-0 origin-bottom" 
                style={{ height: `${height}px`, transform: 'rotateX(-90deg)' }} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const COLORS = ["#3fb950", "#238636", "#2ea043", "#1f6feb", "#8b5cf6", "#f59e0b"];

// --- 4. MAIN APP ---

interface User { githubId: number; username: string; avatarUrl: string; }
interface Stats { day: Record<string, number>; hour: Record<string, number>; languages: Record<string, number>; streaks: { longest: number; mostActiveDay: string; }; }

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    fetch("http://localhost:3000/auth/me", { credentials: "include" })
      .then((res) => { if (res.ok) return res.json(); throw new Error("Not logged in"); })
      .then((data) => { setUser(data); setLoading(false); })
      .catch(() => { setUser(null); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!user) return;
    setStatsLoading(true);
    fetch("http://localhost:3000/api/commits", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => { setStats(data); setStatsLoading(false); });
  }, [user]);

  const handleLogout = async () => {
    await fetch("http://localhost:3000/auth/logout", { credentials: "include" });
    setUser(null);
    setStats(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Terminal className="h-8 w-8 text-primary animate-pulse" />
          <p className="text-muted-foreground font-mono text-sm tracking-widest animate-bounce">INITIALIZING DEVPULSE...</p>
        </div>
      </div>
    );
  }

  // --- LOGIN PAGE (WITH MASSIVE ORBITAL FIELD) ---
  if (!user) {
    // Generate an array of orbital objects for the background
    const orbitalNodes = [
      { Icon: GitBranch, radius: 180, duration: 25, delay: 0, dir: 'orbit-cw', size: 32, color: 'text-emerald-500/40' },
      { Icon: Code, radius: 240, duration: 35, delay: -5, dir: 'orbit-ccw', size: 40, color: 'text-primary/30' },
      { Icon: GitPullRequest, radius: 150, duration: 20, delay: -10, dir: 'orbit-cw', size: 28, color: 'text-violet-500/40' },
      { Icon: Braces, radius: 300, duration: 45, delay: -2, dir: 'orbit-ccw', size: 48, color: 'text-blue-500/20' },
      { Icon: Terminal, radius: 200, duration: 28, delay: -15, dir: 'orbit-cw', size: 24, color: 'text-amber-500/30' },
      { Icon: Database, radius: 280, duration: 40, delay: -8, dir: 'orbit-cw', size: 36, color: 'text-emerald-300/30' },
      { Icon: GitCommit, radius: 120, duration: 15, delay: -4, dir: 'orbit-ccw', size: 20, color: 'text-primary/50' },
      { Icon: Cpu, radius: 350, duration: 60, delay: -20, dir: 'orbit-cw', size: 56, color: 'text-slate-500/20' },
      { Icon: Command, radius: 220, duration: 32, delay: -12, dir: 'orbit-ccw', size: 32, color: 'text-emerald-600/30' },
      { Icon: Code, radius: 260, duration: 38, delay: -25, dir: 'orbit-cw', size: 28, color: 'text-primary/20' },
    ];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden transition-colors duration-500">
        <StyleInject />
        
        {/* Ambient Core Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

        {/* The Massive Orbital Constellation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 z-0 hidden md:block">
          {orbitalNodes.map((node, i) => (
            <div 
              key={i}
              className="absolute top-0 left-0"
              style={{
                '--radius': `${node.radius}px`,
                animation: `${node.dir} ${node.duration}s linear infinite`,
                animationDelay: `${node.delay}s`
              } as React.CSSProperties}
            >
              <node.Icon 
                size={node.size} 
                className={`-ml-[50%] -mt-[50%] ${node.color} drop-shadow-lg`} 
                style={{ animation: `float ${4 + (i%3)}s ease-in-out infinite` }}
              />
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="absolute top-6 right-6 z-20">
          <AnimatedThemeToggle isDark={isDark} setIsDark={setIsDark} />
        </div>

        {/* Center Interactive Card */}
        <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center animate-in fade-in zoom-in-95 duration-1000">
          <div className="p-5 bg-secondary/80 backdrop-blur-xl border border-border rounded-2xl mb-8 shadow-2xl shadow-primary/20 hover:scale-110 hover:rotate-6 transition-transform duration-500 cursor-pointer group">
            <CustomGitHubIcon className="h-14 w-14 text-primary group-hover:animate-pulse" />
          </div>

          <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent mb-4">
            DevPulse
          </h1>
          
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest mb-10">
            [ Git activity, beautifully wrapped ]
          </p>

          <Card className="glass-card w-full shadow-2xl shadow-black/50 p-2 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
            <CardContent className="pt-6 flex flex-col gap-6 relative z-10">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enter the command center. Discover your sprint velocity, top languages, and 3D contribution cities.
              </p>
              <Button size="lg" className="w-full h-14 bg-primary hover:bg-emerald-600 text-primary-foreground text-lg font-bold tracking-wide transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1" asChild>
                <a href="http://localhost:3000/auth/login" className="flex items-center justify-center gap-3">
                  <CustomGitHubIcon className="h-6 w-6" />
                  INITIALIZE LINK
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- DASHBOARD MATHS ---
  const totalCommits = stats ? Object.values(stats.day).reduce((sum, n) => sum + n, 0) : 0;
  const languageChartData = stats ? Object.entries(stats.languages).map(([name, value]) => ({ name, value })) : [];
  const peakHour = stats ? Object.entries(stats.hour).reduce((max, [h, c]) => c > max[1] ? [h, c] : max, ["0", 0]) : null;

  const formatHour = (hour: string) => {
    const h = parseInt(hour);
    if (h === 0) return "12 AM";
    if (h === 12) return "12 PM";
    return h < 12 ? `${h} AM` : `${h - 12} PM`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden">
      <StyleInject />
      <div className="max-w-5xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12 border-b border-border/60 pb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4 group cursor-pointer">
            <Avatar className="h-14 w-14 ring-2 ring-primary/40 group-hover:ring-primary transition-all duration-300 group-hover:scale-105">
              <AvatarImage src={user.avatarUrl} alt={user.username} />
              <AvatarFallback className="bg-secondary text-primary font-bold">{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-bold tracking-tight">{user.username}</p>
              <Badge variant="secondary" className="font-mono text-[10px] tracking-wider text-primary bg-primary/10 border-none px-2 py-0 mt-1">PRO PROFILE</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <AnimatedThemeToggle isDark={isDark} setIsDark={setIsDark} />
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10" onClick={handleLogout}>
              [ TERMINATE SESSION ]
            </Button>
          </div>
        </div>

        {statsLoading && (
          <div className="flex items-center gap-3 text-primary font-mono text-sm py-20 justify-center">
            <Terminal className="h-5 w-5 animate-spin" />
            <span className="animate-pulse">Building 3D City...</span>
          </div>
        )}

        {stats && (
          <div className="flex flex-col gap-10">
            
            {/* Top Grid: Hero Commits & Stat Deck */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              <Card className="glass-card h-full relative overflow-hidden transition-all duration-500 group hover:border-primary/50 hover:shadow-[0_0_40px_-10px_rgba(var(--primary),0.3)] animate-in fade-in zoom-in-95 duration-700">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-primary pointer-events-none group-hover:scale-125 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-700 ease-out">
                  <GitBranch size={200} />
                </div>
                <CardContent className="py-16 text-center relative z-10 flex flex-col justify-center h-full">
                  <p className="text-sm font-mono uppercase tracking-widest text-primary mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                    // Total Contributions
                  </p>
                  <p className="text-8xl md:text-9xl font-black tracking-tighter bg-gradient-to-r from-primary via-emerald-300 to-primary bg-clip-text text-transparent tabular-nums drop-shadow-sm">
                    <NumberTicker value={totalCommits} duration={2000} />
                  </p>
                </CardContent>
              </Card>

              <div className="animate-in fade-in slide-in-from-right-8 duration-700 delay-200 fill-mode-both w-full">
                <StatDeck stats={stats} peakHour={peakHour ? formatHour(peakHour[0]) : "--"} />
              </div>

            </div>

            {/* Bottom Grid: 3D City & Languages */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <Card className="glass-card lg:col-span-2 overflow-hidden group hover:border-primary/30 transition-colors duration-500 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                    <span>Contribution City [ 3D ]</span>
                    <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">DRAG TO ROTATE</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <IsometricCity dailyStats={stats.day} />
                </CardContent>
              </Card>

              <Card className="glass-card hover:border-primary/30 transition-colors duration-500 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both flex flex-col">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Language Core</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-full flex flex-col items-center gap-6">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={languageChartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={5}>
                          {languageChartData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity outline-none cursor-pointer hover:scale-105 origin-center" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-4 justify-center w-full">
                      {languageChartData.map((lang, index) => (
                        <div key={lang.name} className="flex items-center gap-2 text-sm group cursor-default">
                          <span className="w-3 h-3 rounded-sm transition-transform group-hover:scale-125" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="font-mono text-muted-foreground group-hover:text-foreground transition-colors">{lang.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;