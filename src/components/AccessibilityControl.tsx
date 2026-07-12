import React from "react";
import { Eye, Type, Volume2, HelpCircle, Sun, Moon } from "lucide-react";

interface AccessibilityProps {
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  fontSize: "normal" | "large" | "extra-large";
  setFontSize: (size: "normal" | "large" | "extra-large") => void;
  screenReaderActive: boolean;
  setScreenReaderActive: (val: boolean) => void;
  announceText: (text: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const AccessibilityControl: React.FC<AccessibilityProps> = ({
  highContrast,
  setHighContrast,
  fontSize,
  setFontSize,
  screenReaderActive,
  setScreenReaderActive,
  announceText,
  darkMode,
  setDarkMode,
}) => {
  const handleToggleContrast = () => {
    const nextVal = !highContrast;
    setHighContrast(nextVal);
    announceText(nextVal ? "High contrast mode enabled." : "High contrast mode disabled.");
  };

  const handleToggleTheme = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    announceText(nextVal ? "Dark theme option enabled." : "Light theme option enabled.");
  };

  const handleToggleReader = () => {
    const nextVal = !screenReaderActive;
    setScreenReaderActive(nextVal);
    if (nextVal) {
      announceText("AI screen reader voice synthesis activated. All stadium system alerts will now read aloud.");
    } else {
      announceText("AI screen reader deactivated.");
    }
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value as "normal" | "large" | "extra-large";
    setFontSize(size);
    announceText(`Font scale size adjusted to ${size}.`);
  };

  return (
    <div
      id="accessibility-control-panel"
      className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 flex flex-wrap gap-4 items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          WCAG 2.1 AA Assistive Tools:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Light & Dark Mode Toggle */}
        <button
          id="btn-theme-toggle"
          onClick={handleToggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 shadow-sm cursor-pointer"
          aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* High Contrast */}
        <button
          id="btn-high-contrast"
          onClick={handleToggleContrast}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            highContrast
              ? "bg-zinc-900 text-white border-zinc-900"
              : "bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
          }`}
          aria-pressed={highContrast}
          aria-label="Toggle High Contrast Display Mode"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Contrast</span>
        </button>

        {/* Text Size Scale */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <Type className="w-3.5 h-3.5 text-zinc-500" />
          <label htmlFor="select-font-size" className="sr-only">
            Adjust text font scale
          </label>
          <select
            id="select-font-size"
            value={fontSize}
            onChange={handleSizeChange}
            className="text-xs font-medium bg-transparent text-zinc-700 dark:text-zinc-300 border-none focus:ring-0 cursor-pointer outline-none"
          >
            <option value="normal">Text: Normal</option>
            <option value="large">Text: Large (115%)</option>
            <option value="extra-large">Text: XL (130%)</option>
          </select>
        </div>

        {/* AI Screen Reader Simulation */}
        <button
          id="btn-screen-reader"
          onClick={handleToggleReader}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            screenReaderActive
              ? "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-700"
              : "bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
          }`}
          aria-pressed={screenReaderActive}
          aria-label="Toggle Vocal Screen Reader Support"
        >
          <Volume2 className={`w-3.5 h-3.5 ${screenReaderActive ? "animate-pulse" : ""}`} />
          <span>Voice Alerts</span>
        </button>
      </div>
    </div>
  );
};
