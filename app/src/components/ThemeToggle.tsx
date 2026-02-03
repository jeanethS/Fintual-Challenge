"use client";

import React from "react";
import { useTheme } from "@/hooks/useTheme";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      className="button is-small is-link is-light"
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
    >
      <span aria-hidden="true">{isDark ? "☾" : "☀"}</span>
      <span className="is-size-7">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
};

export default ThemeToggle;
