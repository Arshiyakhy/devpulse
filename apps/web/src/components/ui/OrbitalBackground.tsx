import { GitBranch, Code, Terminal, GitPullRequest, GitCommit, Braces, Database, Cpu, Command } from "lucide-react";

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

export function OrbitalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Ambient core glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />

      {/* Orbiting icons */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 hidden md:block">
        {orbitalNodes.map((node, i) => (
          <div
            key={i}
            className="absolute top-0 left-0"
            style={{
              "--radius": `${node.radius}px`,
              animation: `${node.dir} ${node.duration}s linear infinite`,
              animationDelay: `${node.delay}s`,
            } as React.CSSProperties}
          >
            <node.Icon
              size={node.size}
              className={`-ml-[50%] -mt-[50%] ${node.color} drop-shadow-lg`}
              style={{ animation: `float ${4 + (i % 3)}s ease-in-out infinite` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}