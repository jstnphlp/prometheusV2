"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { HeroAtmosphereScene } from "@/lib/three/create-hero-atmosphere";

import styles from "./hero-atmosphere.module.css";

type HeroAtmosphereClientProps = {
  forceMotion?: boolean;
};

export function HeroAtmosphereClient({
  forceMotion = false,
}: HeroAtmosphereClientProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HeroAtmosphereScene | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const hostElement: HTMLDivElement = host;

    const controller = new AbortController();
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let intersectionObserver: IntersectionObserver | undefined;
    let reducedMotionCleanup: (() => void) | undefined;
    let disposed = false;

    async function start() {
      try {
        const { createHeroAtmosphere, defaultHeroAtmosphereTuning } =
          await import("@/lib/three/create-hero-atmosphere");
        if (controller.signal.aborted) return;

        const scene = await createHeroAtmosphere({
          host: hostElement,
          textureUrl: "/assets/hero/sky.webp",
          signal: controller.signal,
          reducedMotion: forceMotion ? false : reducedMotion.matches,
          tuning: defaultHeroAtmosphereTuning,
        });

        if (disposed) {
          scene.dispose();
          return;
        }

        sceneRef.current = scene;
        setReady(true);

        const handleReducedMotion = () => {
          scene.setReducedMotion(forceMotion ? false : reducedMotion.matches);
        };
        reducedMotion.addEventListener("change", handleReducedMotion);
        reducedMotionCleanup = () =>
          reducedMotion.removeEventListener("change", handleReducedMotion);

        intersectionObserver = new IntersectionObserver(
          ([entry]) => {
            scene.setVisible(entry.isIntersecting && !document.hidden);
          },
          { threshold: 0.01 },
        );
        intersectionObserver.observe(hostElement);
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

    void start();

    return () => {
      disposed = true;
      controller.abort();
      intersectionObserver?.disconnect();
      reducedMotionCleanup?.();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [forceMotion]);

  return (
    <div className={styles.root}>
      <Image
        className={styles.fallback}
        src="/assets/hero/sky.webp"
        alt=""
        fill
        sizes="100vw"
        loading="eager"
        draggable={false}
        data-hidden={ready && !failed ? "true" : "false"}
      />
      <div ref={hostRef} className={styles.canvasHost} />
    </div>
  );
}
