import { IconFocus2, IconMoon, IconSun } from "../icons";

type TopBarProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onToggleZen: () => void;
};

export function TopBar({ theme, onToggleTheme, onToggleZen }: TopBarProps) {
  return (
    <div className="top-bar hide-in-zen">
      <button
        className="icon-btn"
        onClick={onToggleTheme}
        title="Toggle Dark/Light Mode"
      >
        {theme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
      </button>
      <button
        className="icon-btn"
        onClick={onToggleZen}
        title="Toggle Zen Mode"
      >
        <IconFocus2 size={18} />
      </button>
    </div>
  );
}
