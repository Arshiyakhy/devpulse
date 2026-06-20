import { useRef } from "react";
import { Particles, ParticlesProvider } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { motion } from "framer-motion";

// This package version uses a Provider/Context pattern instead of a
// one-time initParticlesEngine() call. Wrap the app (or any subtree that
// renders <Particles>) in <ParticleEngineProvider> once.
const registerEngine = async (engine: Engine) => {
  await loadFull(engine);
};

export function ParticleEngineProvider({ children }: { children: React.ReactNode }) {
  return <ParticlesProvider init={registerEngine}>{children}</ParticlesProvider>;
}

const baseOptions: Partial<ISourceOptions> = {
  fullScreen: { enable: false },
  fpsLimit: 60,
  detectRetina: true,
};

function fireOptions(): ISourceOptions {
  return {
    ...baseOptions,
    particles: {
      number: { value: 0 },
      color: { value: ["#fde68a", "#fb923c", "#ef4444", "#facc15"] },
      shape: { type: "circle" },
      opacity: {
        value: { min: 0.3, max: 0.9 },
        animation: { enable: true, speed: 1.5, startValue: "max", destroy: "min" },
      },
      size: { value: { min: 4, max: 14 } },
      move: {
        enable: true,
        speed: { min: 3, max: 8 },
        direction: "top",
        random: true,
        straight: false,
        outModes: { default: "destroy" },
        gravity: { enable: true, acceleration: -4 },
      },
      life: { duration: { value: 1.4 }, count: 1 },
      wobble: { enable: true, distance: 12, speed: { min: 8, max: 16 } },
    },
    emitters: {
      life: { count: 1, duration: 0.9, delay: 0 },
      rate: { delay: 0.02, quantity: 4 },
      size: { width: 100, height: 0 },
      position: { x: 50, y: 100 },
    },
  } as ISourceOptions;
}

function floodOptions(): ISourceOptions {
  return {
    ...baseOptions,
    particles: {
      number: { value: 0 },
      color: { value: ["#38bdf8", "#0ea5e9", "#0284c7", "#bae6fd"] },
      shape: { type: "circle" },
      opacity: { value: { min: 0.4, max: 0.85 } },
      size: { value: { min: 3, max: 9 } },
      move: {
        enable: true,
        speed: { min: 6, max: 14 },
        direction: "top",
        outModes: { default: "destroy" },
        gravity: { enable: true, acceleration: -2 },
        straight: false,
        random: true,
      },
      life: { duration: { value: 1.1 }, count: 1 },
    },
    emitters: {
      life: { count: 1, duration: 1, delay: 0 },
      rate: { delay: 0.015, quantity: 6 },
      size: { width: 100, height: 0 },
      position: { x: 50, y: 100 },
    },
  } as ISourceOptions;
}

function windOptions(): ISourceOptions {
  return {
    ...baseOptions,
    particles: {
      number: { value: 0 },
      color: { value: ["#e2e8f0", "#94a3b8", "#cbd5e1"] },
      shape: { type: "line" },
      stroke: { width: 1, color: { value: "#94a3b8" } },
      opacity: { value: { min: 0.2, max: 0.7 } },
      size: { value: { min: 20, max: 60 } },
      move: {
        enable: true,
        speed: { min: 18, max: 32 },
        direction: "right",
        straight: true,
        outModes: { default: "destroy" },
      },
      life: { duration: { value: 0.8 }, count: 1 },
      rotate: { value: 0 },
    },
    emitters: {
      life: { count: 1, duration: 0.7, delay: 0 },
      rate: { delay: 0.01, quantity: 3 },
      size: { width: 0, height: 100 },
      position: { x: 0, y: 50 },
    },
  } as ISourceOptions;
}

function earthquakeOptions(): ISourceOptions {
  return {
    ...baseOptions,
    particles: {
      number: { value: 0 },
      color: { value: ["#a8a29e", "#78716c", "#57534e"] },
      shape: { type: "square" },
      opacity: { value: { min: 0.4, max: 0.9 } },
      size: { value: { min: 3, max: 8 } },
      move: {
        enable: true,
        speed: { min: 2, max: 6 },
        direction: "bottom",
        gravity: { enable: true, acceleration: 9 },
        outModes: { default: "destroy" },
        random: true,
      },
      life: { duration: { value: 1.2 }, count: 1 },
      rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 30 } },
    },
    emitters: {
      life: { count: 1, duration: 0.9, delay: 0 },
      rate: { delay: 0.015, quantity: 4 },
      size: { width: 100, height: 0 },
      position: { x: 50, y: 50 },
    },
  } as ISourceOptions;
}

type Element = "fire" | "earthquake" | "wind" | "flood";

function getOptions(element: Element): ISourceOptions {
  if (element === "fire") return fireOptions();
  if (element === "flood") return floodOptions();
  if (element === "wind") return windOptions();
  return earthquakeOptions();
}

export function ParticleBreak({ element }: { element: Element }) {
  const id = useRef(`particles-${element}-${Math.random().toString(36).slice(2)}`);

  return (
    <div className="absolute inset-0 overflow-visible pointer-events-none z-20">
      <Particles id={id.current} options={getOptions(element)} className="absolute inset-0" />

      {/* Flood gets an extra rising water sheet + GitHub mark, particles alone don't read as "water" */}
      {element === "flood" && (
        <>
          <motion.div
            className="absolute left-0 right-0 bottom-0"
            style={{
              background:
                "linear-gradient(180deg, #38bdf8aa 0%, #0284c7cc 55%, #075985ee 100%)",
            }}
            initial={{ height: "0%" }}
            animate={{ height: "100%" }}
            transition={{ duration: 1, ease: "easeIn" }}
          />
          <motion.div
            className="absolute"
            initial={{ bottom: "-15%", left: "42%", opacity: 0, rotate: -8 }}
            animate={{ bottom: "50%", left: "52%", opacity: 1, rotate: 8 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="drop-shadow-lg">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.7 5.41-5.27 5.69.42.36.78 1.08.78 2.18 0 1.58-.01 2.85-.01 3.24 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
          </motion.div>
        </>
      )}

      {/* Fire gets an underlying char/blacken wash so it doesn't feel like sparks on nothing */}
      {element === "fire" && (
        <motion.div
          className="absolute inset-0 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 1, ease: "easeIn" }}
        />
      )}
    </div>
  );
}

// Screen-shake wrapper specifically for the earthquake card — wrap the whole
// card in this so the shake reads as the card itself trembling, not just
// debris falling.
export function EarthquakeShake({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      animate={
        active
          ? { x: [0, -8, 8, -6, 6, -3, 3, 0], y: [0, 4, -4, 3, -3, 1, 0] }
          : { x: 0, y: 0 }
      }
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}