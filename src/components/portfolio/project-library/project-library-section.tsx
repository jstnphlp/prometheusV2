import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/libre-caslon-display/latin-400.css";

import { prometheusLibrary } from "@/content/library";

import { ProjectLibraryClient } from "./project-library-client";
import styles from "./project-library.module.css";

export function ProjectLibrarySection() {
  return (
    <section
      id="library"
      className={styles.library}
      aria-labelledby="library-title"
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>{prometheusLibrary.eyebrow}</p>
          <h2 id="library-title">{prometheusLibrary.title}</h2>
        </div>
        <p className={styles.introduction}>
          A collection of partnerships and possibilities.
          <br />
          Choose a volume to explore.
        </p>
      </header>

      <ProjectLibraryClient />

      <noscript>
        <p className={styles.noScript}>
          Enable JavaScript to explore the interactive Prometheus Library.
        </p>
      </noscript>
    </section>
  );
}
