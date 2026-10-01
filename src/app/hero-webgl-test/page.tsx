import Image from "next/image";

import { HeroNavigation } from "@/app/_components/hero-navigation";
import heroStyles from "@/app/_components/hero.module.css";
import { HeroAtmosphereClient } from "@/components/portfolio/hero/hero-atmosphere-client";

export default function HeroWebglTestPage() {
  return (
    <>
      <HeroNavigation />
      <main>
        <section
          id="top"
          className={heroStyles.hero}
          aria-labelledby="hero-webgl-test-title"
        >
          <div className={heroStyles.scene} aria-hidden="true">
            <HeroAtmosphereClient />
          </div>

          <div className={heroStyles.figure} aria-hidden="true">
            <Image
              src="/assets/hero/figure.webp"
              alt=""
              width={986}
              height={718}
              sizes="(max-width: 640px) 124vw, (max-width: 1000px) 95vw, 62vw"
              priority
              draggable={false}
            />
          </div>

          <div className={heroStyles.content}>
            <div className={heroStyles.copy}>
              <h1
                id="hero-webgl-test-title"
                className={heroStyles.title}
              >
                <span>Where Ideas</span>{" "}
                <span className={heroStyles.titleLast}>
                  Ignite<span className={heroStyles.period}>.</span>
                </span>
              </h1>
              <p className={heroStyles.subtitle}>
                We turn ambitious ideas into systems built around the way your
                business actually works.
              </p>
              <p className={heroStyles.eyebrow}>Creative systems studio</p>
              <div className={heroStyles.actions}>
                <a className={heroStyles.primary} href="#atmosphere-notes">
                  Inspect atmosphere <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="atmosphere-notes"
          style={{
            minHeight: "100svh",
            padding: "clamp(48px, 8vw, 120px)",
            background: "#181a1b",
            color: "#f4ebde",
          }}
        >
          <div style={{ maxWidth: 760 }}>
            <p
              style={{
                margin: 0,
                color: "#d3985c",
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Prototype notes
            </p>
            <h2
              style={{
                margin: "18px 0 0",
                fontFamily: "var(--brand-serif)",
                fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
                fontWeight: 400,
                lineHeight: 0.95,
              }}
            >
              WebGL atmosphere test
            </h2>
            <p style={{ marginTop: 28, maxWidth: 620, lineHeight: 1.8 }}>
              This route deliberately leaves the production homepage untouched.
              It uses the existing hero sky as the visual source while testing
              local cloud motion, restrained painterly deformation, and
              procedural sunlight. Final transparent cloud layers can replace
              the prototype sampling without changing the scene boundary.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
