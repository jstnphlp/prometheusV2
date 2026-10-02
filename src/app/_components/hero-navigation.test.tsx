import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { HeroNavigation } from "./hero-navigation";

beforeEach(() => vi.stubGlobal("scrollY", 0));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function scrollTo(top: number) {
  vi.stubGlobal("scrollY", top);
  fireEvent.scroll(window);
}

it("hides scrolling down, returns scrolling up, and ignores small fluctuations", () => {
  const { unmount } = render(<HeroNavigation />);
  const header = screen.getByRole("banner");
  expect(header).toHaveAttribute("data-navigation-visible", "true");

  scrollTo(300);
  expect(header).toHaveAttribute("data-navigation-visible", "false");
  expect(header).toHaveAttribute("data-navigation-floating", "true");
  scrollTo(297);
  expect(header).toHaveAttribute("data-navigation-visible", "false");
  scrollTo(280);
  expect(header).toHaveAttribute("data-navigation-visible", "true");
  scrollTo(320);
  expect(header).toHaveAttribute("data-navigation-visible", "false");
  scrollTo(0);
  expect(header).toHaveAttribute("data-navigation-visible", "true");
  expect(header).toHaveAttribute("data-navigation-floating", "false");

  unmount();
  scrollTo(300);
  expect(header).toHaveAttribute("data-navigation-visible", "true");
});

it("shows navigation on upward scroll after loading a lower section", () => {
  vi.stubGlobal("scrollY", 1200);
  render(<HeroNavigation />);
  const header = screen.getByRole("banner");
  expect(header).toHaveAttribute("data-navigation-visible", "false");
  scrollTo(1180);
  expect(header).toHaveAttribute("data-navigation-visible", "true");
});

it("only preserves focus visibility during keyboard navigation and releases it for pointer scrolling", () => {
  const { unmount } = render(<HeroNavigation />);
  const header = screen.getByRole("banner");
  expect(header).toHaveAttribute("data-navigation-keyboard", "false");
  fireEvent.keyDown(document, { key: "Tab" });
  expect(header).toHaveAttribute("data-navigation-keyboard", "true");
  fireEvent.wheel(window);
  expect(header).toHaveAttribute("data-navigation-keyboard", "false");
  fireEvent.keyDown(document, { key: "Tab" });
  fireEvent.pointerDown(document);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(header).toHaveAttribute("data-navigation-keyboard", "false");
  fireEvent.keyDown(document, { key: "Tab" });
  fireEvent.touchStart(document);
  expect(header).toHaveAttribute("data-navigation-keyboard", "false");

  unmount();
  fireEvent.keyDown(document, { key: "Tab" });
  expect(header).toHaveAttribute("data-navigation-keyboard", "false");
});
