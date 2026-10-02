"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useEffect, useRef, useState } from "react";

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
  const closeRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let previousScroll = Math.max(0, window.scrollY);
    header.dataset.navigationVisible = String(previousScroll <= 88);
    header.dataset.navigationFloating = String(previousScroll > 88);

    function scrolled() {
      const scroll = Math.max(0, window.scrollY);
      header!.dataset.navigationFloating = String(scroll > 88);
      if (scroll <= 88) {
        header!.dataset.navigationVisible = "true";
        previousScroll = scroll;
      } else if (Math.abs(scroll - previousScroll) >= 8) {
        // Ignore small scroll fluctuations so the button does not flicker.
        header!.dataset.navigationVisible = String(scroll < previousScroll);
        previousScroll = scroll;
      }
    }

    function keyboardUsed(event: KeyboardEvent) {
      if (event.key === "Tab") header!.dataset.navigationKeyboard = "true";
    }

    function pointerUsed() {
      header!.dataset.navigationKeyboard = "false";
    }

    window.addEventListener("scroll", scrolled, { passive: true });
    document.addEventListener("keydown", keyboardUsed);
    document.addEventListener("pointerdown", pointerUsed, { passive: true });
    document.addEventListener("touchstart", pointerUsed, { passive: true });
    window.addEventListener("wheel", pointerUsed, { passive: true });
    return () => {
      window.removeEventListener("scroll", scrolled);
      document.removeEventListener("keydown", keyboardUsed);
      document.removeEventListener("pointerdown", pointerUsed);
      document.removeEventListener("touchstart", pointerUsed);
      window.removeEventListener("wheel", pointerUsed);
    };
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <header
        ref={headerRef}
        className={styles.header}
        data-navigation-open={open}
        data-navigation-visible="true"
        data-navigation-floating="false"
        data-navigation-keyboard="false"
      >
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
      </header>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.scrim} />
        <Dialog.Popup className={styles.navPanel} initialFocus={closeRef}>
          <div className={styles.navHeader}>
            <Dialog.Title className={styles.srOnly}>
              {appConfig.name}
            </Dialog.Title>
            <Dialog.Close
              ref={closeRef}
              className={styles.menuClose}
              aria-label="Close navigation"
            >
              <span className={styles.closeIcon} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className={styles.navDescription}>
            Creative technology. Thoughtful digital systems.
          </Dialog.Description>
          <nav className={styles.navLinks} aria-label="Primary navigation">
            {links.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                <span className={styles.navNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {link.label}
                <span className={styles.navArrow} aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </nav>
          <div className={styles.navFooter}>
            <p>Good things begin with an idea.</p>
            <a href="#contact" onClick={() => setOpen(false)}>
              Start a conversation <span aria-hidden="true">→</span>
            </a>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
