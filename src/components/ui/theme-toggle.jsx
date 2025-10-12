import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "dark") setTheme("system");
    else if (theme === "system") setTheme("light");
    else setTheme("dark");
  };

  const getIcon = () => {
    if (theme === "dark") return <Moon className="w-4 h-4" />;
    if (theme === "light") return <Sun className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <>
      {/* Mobile: Single button that cycles through themes */}
      <button
        type="button"
        onClick={cycleTheme}
        className="md:hidden flex items-center justify-center p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-all"
        title={`Current: ${theme} theme`}
      >
        {getIcon()}
      </button>

      {/* Desktop: Full theme switcher */}
      <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg p-0.5">
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
            theme === "dark"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Dark theme"
        >
          <Moon className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
            theme === "system"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="System theme"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">System</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
            theme === "light"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Light theme"
        >
          <Sun className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Light</span>
        </button>
      </div>
    </>
  );
}
