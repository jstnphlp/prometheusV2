"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";

import { appConfig } from "@/config/app";

import styles from "./hero.module.css";

const links = [
  { href: "#work", label: "Work" },
  { href: "#approach", label: "Approach" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#contact", label: "Contact" },
] as const;

export function HeroNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <header className={styles.header} data-navigation-open={open}>
        <a
          className={styles.brand}
          href="#top"
          aria-label={`${appConfig.name} home`}
          onClick={() => setOpen(false)}
        >
          <span className={styles.ribbon} aria-hidden="true">
            <span className={styles.mark} />
          </span>
        </a>

        {open ? (
          <Dialog.Close
            className={styles.menuToggle}
            aria-label="Close navigation"
          >
            <span
              className={styles.hamburger}
              data-open="true"
              aria-hidden="true"
            >
              <span />
              <span />
              <span />
            </span>
          </Dialog.Close>
        ) : (
          <Dialog.Trigger
            className={styles.menuToggle}
            aria-label="Open navigation"
          >
            <span className={styles.hamburger} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </Dialog.Trigger>
        )}
      </header>

      <Dialog.Portal>
        <Dialog.Backdrop className={styles.scrim} />
        <Dialog.Popup className={styles.navPanel}>
          <Dialog.Title className={styles.srOnly}>
            {appConfig.name}
          </Dialog.Title>

          <div className={styles.navLayout}>
            <aside className={styles.navUtility}>
              <Dialog.Description className={styles.navDescription}>
                Creative technology. Thoughtful digital systems.
              </Dialog.Description>
            </aside>

            <nav className={styles.navLinks} aria-label="Primary navigation">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className={styles.navBottom}>
              <p>Good things begin with an idea.</p>
              <a href="#contact" onClick={() => setOpen(false)}>
                Start a conversation <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
