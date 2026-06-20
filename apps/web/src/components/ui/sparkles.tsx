import { useMemo } from "react";
import { motion } from "framer-motion";

type SparklesProps = {
  id?: string;
  className?: string;
  background?: string;
  particleColor?: string;
  particleDensity?: number;
  minSize?: number;
  maxSize?: number;
};

// Simple, dependency-free sparkle field. Generates a fixed set of randomly
// placed dots that twinkle (fade in/out) on a loop. No particle engine —
// just framer-motion opacity/scale animations, which is plenty for an
// ambient background effect.
export function SparklesCore({
  className,
  background = "transparent",
  particleColor = "var(--primary)",
  particleDensity = 60,
  minSize = 0.5,
  maxSize = 1.4,
}: SparklesProps) {
  const sparkles = useMemo(() => {
    return Array.from({ length: particleDensity }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: minSize + Math.random() * (maxSize - minSize),
      delay: Math.random() * 3,
      duration: 1.5 + Math.random() * 2,
    }));
  }, [particleDensity, minSize, maxSize]);

  return (
    <div className={className} style={{ position: "relative", background, overflow: "hidden" }}>
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size * 3,
            height: s.size * 3,
            backgroundColor: particleColor,
          }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 1, 0], scale: [0.3, 1, 0.3] }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}