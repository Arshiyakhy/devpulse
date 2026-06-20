import { motion } from "framer-motion";

type Element = "fire" | "earthquake" | "wind" | "flood";

// ---------------- Fire ----------------
// Layered flame blobs rising with flicker + a heat-glow wash. Pure CSS
// gradients driven by framer-motion, no particle engine.

function FireBreak() {
  const flames = Array.from({ length: 22 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* base heat glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.55) 0%, rgba(220,38,38,0.35) 40%, transparent 75%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.8] }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
      {flames.map((_, i) => {
        const left = 2 + Math.random() * 96;
        const delay = Math.random() * 0.4;
        const size = 18 + Math.random() * 36;
        const drift = (Math.random() - 0.5) * 60;
        const dur = 0.9 + Math.random() * 0.6;
        return (
          <motion.div
            key={i}
            className="absolute bottom-0 rounded-[50%_50%_50%_50%/_60%_60%_40%_40%]"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 1.6,
              background:
                "radial-gradient(circle at 50% 75%, #fef9c3 0%, #fbbf24 30%, #f97316 55%, #dc2626 78%, transparent 100%)",
              filter: "blur(1px)",
            }}
            initial={{ opacity: 0, y: 10, x: 0, scale: 0.3 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: -160 - Math.random() * 120,
              x: drift,
              scale: [0.3, 1.2, 0.9, 0.15],
            }}
            transition={{ duration: dur, delay, ease: "easeOut" }}
          />
        );
      })}
      {/* card chars to black underneath the flames */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.88 }}
        transition={{ duration: 1.1, ease: "easeIn", delay: 0.15 }}
      />
    </div>
  );
}

// ---------------- Earthquake ----------------
// Violent multi-axis shake with visible crack lines that widen, plus
// chunks of "rock" falling away at the end.

function EarthquakeBreak() {
  const cracks = Array.from({ length: 6 });
  const debris = Array.from({ length: 10 });
  return (
    <div className="absolute inset-0 overflow-visible pointer-events-none">
      {cracks.map((_, i) => {
        const top = 8 + i * 15 + Math.random() * 6;
        const skew = (Math.random() - 0.5) * 14;
        return (
          <motion.div
            key={i}
            className="absolute bg-foreground/70"
            style={{
              left: 0,
              top: `${top}%`,
              height: 2,
              width: "100%",
              transform: `skewY(${skew}deg)`,
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: [0, 1, 1], scaleX: [0, 1, 1] }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
        );
      })}
      {debris.map((_, i) => {
        const left = Math.random() * 100;
        const size = 8 + Math.random() * 16;
        const delay = 0.3 + Math.random() * 0.3;
        return (
          <motion.div
            key={i}
            className="absolute bg-stone-500 rounded-sm"
            style={{ left: `${left}%`, top: `${Math.random() * 100}%`, width: size, height: size }}
            initial={{ opacity: 0, y: 0, rotate: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: 220 + Math.random() * 100,
              rotate: (Math.random() - 0.5) * 400,
            }}
            transition={{ duration: 0.8, delay, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}

// ---------------- Wind ----------------
// Dense horizontal speed-lines at varying speed/opacity/length, sweeping
// across in a tight burst, like the card got hit by a gale.

function WindBreak() {
  const streaks = Array.from({ length: 28 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {streaks.map((_, i) => {
        const top = Math.random() * 100;
        const delay = Math.random() * 0.35;
        const width = 50 + Math.random() * 180;
        const thickness = Math.random() > 0.7 ? 2 : 1;
        const dur = 0.45 + Math.random() * 0.35;
        return (
          <motion.div
            key={i}
            className="absolute bg-gradient-to-r from-transparent via-foreground/60 to-transparent"
            style={{ left: "-30%", top: `${top}%`, width, height: thickness }}
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: 700, opacity: [0, 1, 1, 0] }}
            transition={{ duration: dur, delay, ease: "easeIn" }}
          />
        );
      })}
      {/* whole card whooshes sideways and out */}
      <motion.div
        className="absolute inset-0 bg-card/40"
        initial={{ x: 0, opacity: 1 }}
        animate={{ x: 320, opacity: 0 }}
        transition={{ duration: 0.7, ease: "easeIn", delay: 0.1 }}
      />
    </div>
  );
}

// ---------------- Flood ----------------
// Water rises fast from the bottom with a foamy, animated wave lip, a
// GitHub mark rides the surface, then everything submerges.

function FloodBreak() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute left-0 right-0 bottom-0"
        style={{
          background:
            "linear-gradient(180deg, #7dd3fc 0%, #0ea5e9 35%, #0369a1 70%, #0c4a6e 100%)",
        }}
        initial={{ height: "0%" }}
        animate={{ height: "120%" }}
        transition={{ duration: 1, ease: [0.36, 0, 0.66, -0.56] }}
      >
        {/* animated foam lip riding the top edge of the water */}
        <motion.div
          className="absolute -top-3 left-0 right-0 h-4"
          style={{
            background:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.85) 0 14px, transparent 14px 28px)",
            borderRadius: "50%",
          }}
          animate={{ x: [0, -28, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* GitHub mark riding the wave */}
      <motion.div
        className="absolute"
        initial={{ bottom: "-20%", left: "38%", opacity: 0, rotate: -14 }}
        animate={{ bottom: "55%", left: "55%", opacity: 1, rotate: 12 }}
        transition={{ duration: 0.85, ease: "easeOut" }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="white" className="drop-shadow-lg">
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.7 5.41-5.27 5.69.42.36.78 1.08.78 2.18 0 1.58-.01 2.85-.01 3.24 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>
      </motion.div>

      {/* bubbles rising through the water for extra texture */}
      {Array.from({ length: 10 }).map((_, i) => {
        const left = 10 + Math.random() * 80;
        const delay = 0.2 + Math.random() * 0.5;
        const size = 3 + Math.random() * 6;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/50"
            style={{ left: `${left}%`, width: size, height: size, bottom: "0%" }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.8, 0], y: -140 - Math.random() * 60 }}
            transition={{ duration: 0.9, delay, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

export function ElementalBreak({ element }: { element: Element }) {
  if (element === "fire") return <FireBreak />;
  if (element === "earthquake") return <EarthquakeBreak />;
  if (element === "wind") return <WindBreak />;
  return <FloodBreak />;
}

// Screen-shake wrapper specifically for the earthquake card.
export function EarthquakeShake({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      animate={
        active
          ? { x: [0, -14, 14, -10, 10, -6, 6, -2, 2, 0], y: [0, 8, -8, 6, -6, 3, -3, 0] }
          : { x: 0, y: 0 }
      }
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}