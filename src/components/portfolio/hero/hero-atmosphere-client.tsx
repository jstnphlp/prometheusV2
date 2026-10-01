"use client";

import { useEffect, useRef, useState } from "react";

import type {
  HeroAtmosphereScene,
  HeroAtmosphereTuning,
} from "@/lib/three/create-hero-atmosphere";

import styles from "./hero-atmosphere.module.css";

const defaultTuning: HeroAtmosphereTuning = {
  farCloudSpeed: 0.010,
  midCloudSpeed: 0.018,
  farDistortion: 0.0012,
  midDistortion: 0.0018,
  sunIntensity: 0.34,
  sunRayOpacity: 0.22,
  sunMovement: 0.014,
};

type TuningKey = keyof HeroAtmosphereTuning;

const controls: Array<{
  key: TuningKey;
  label: string;
  min: number;
  max: number;
  step: number;
}> = [
  {
    key: "farCloudSpeed",
    label: "Far drift",
    min: 0,
    max: 0.04,
    step: 0.001,
  },
  {
    key: "midCloudSpeed",
    label: "Mid drift",
    min: 0,
    max: 0.05,
    step: 0.001,
  },
  {
    key: "farDistortion",
    label: "Far distortion",
    min: 0,
    max: 0.004,
    step: 0.0001,
  },
  {
    key: "midDistortion",
    label: "Mid distortion",
    min: 0,
    max: 0.006,
    step: 0.0001,
  },
  {
    key: "sunIntensity",
    label: "Sun intensity",
    min: 0,
    max: 0.8,
    step: 0.01,
  },
  {
    key: "sunRayOpacity",
    label: "Ray opacity",
    min: 0,
    max: 0.5,
    step: 0.01,
  },
  {
    key: "sunMovement",
    label: "Sun movement",
    min: 0,
    max: 0.04,
    step: 0.001,
  },
];

export function HeroAtmosphereClient() {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HeroAtmosphereScene | null>(null);
  const [tuning, setTuning] = useState(defaultTuning);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const controller = new AbortController();
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let intersectionObserver: IntersectionObserver | undefined;
    let disposed = false;

    async function start() {
      try {
        const { createHeroAtmosphere } = await import(
          "@/lib/three/create-hero-atmosphere"
        );
        if (controller.signal.aborted) return;

        const scene = await createHeroAtmosphere({
          host,
          textureUrl: "/assets/hero/sky.webp",
          signal: controller.signal,
          reducedMotion: reducedMotion.matches,
          tuning: defaultTuning,
        });

        if (disposed) {
          scene.dispose();
          return;
        }

        sceneRef.current = scene;
        setReady(true);

        const handleReducedMotion = () => {
          scene.setReducedMotion(reducedMotion.matches);
        };
        reducedMotion.addEventListener("change", handleReducedMotion);

        intersectionObserver = new IntersectionObserver(
          ([entry]) => {
            scene.setVisible(entry.isIntersecting);
          },
          { threshold: 0.01 },
        );
        intersectionObserver.observe(host);

        return () => {
          reducedMotion.removeEventListener("change", handleReducedMotion);
        };
      } catch (error) {
        if (
          controller.signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }
        console.error("Hero WebGL atmosphere failed to initialize.", error);
        setFailed(true);
      }
    }

    let removeReducedMotionListener: (() => void) | undefined;
    void start().then((cleanup) => {
      removeReducedMotionListener = cleanup;
    });

    return () => {
      disposed = true;
      controller.abort();
      intersectionObserver?.disconnect();
      removeReducedMotionListener?.();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  function updateTuning(key: TuningKey, value: number) {
    setTuning((current) => {
      const next = { ...current, [key]: value };
      sceneRef.current?.setTuning(next);
      return next;
    });
  }

  return (
    <div className={styles.root}>
      <div ref={hostRef} className={styles.canvasHost} />

      <img
        className={styles.fallback}
        src="/assets/hero/sky.webp"
        alt=""
        aria-hidden="true"
        data-hidden={ready && !failed}
      />

      {!failed ? (
        <button
          type="button"
          className={styles.debugToggle}
          onClick={() => setShowControls((visible) => !visible)}
          aria-expanded={showControls}
        >
          Atmosphere
        </button>
      ) : null}

      {showControls && !failed ? (
        <div className={styles.debugPanel}>
          <div className={styles.debugHeader}>
            <strong>Atmosphere tuning</strong>
            <button
              type="button"
              onClick={() => {
                setTuning(defaultTuning);
                sceneRef.current?.setTuning(defaultTuning);
              }}
            >
              Reset
            </button>
          </div>

          {controls.map((control) => (
            <label key={control.key} className={styles.control}>
              <span>
                {control.label}
                <output>{tuning[control.key].toFixed(4)}</output>
              </span>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={tuning[control.key]}
                onChange={(event) =>
                  updateTuning(control.key, Number(event.target.value))
                }
              />
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
