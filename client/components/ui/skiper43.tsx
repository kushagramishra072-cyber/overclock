import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Skiper43NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: string | number;
  highlight?: boolean;
}

interface Skiper43TaskbarProps {
  items: Skiper43NavItem[];
  activePath: string;
  onSelect: (item: Skiper43NavItem) => void;
  className?: string;
}

export function Skiper43Taskbar({
  items,
  activePath,
  onSelect,
  className,
}: Skiper43TaskbarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transform-gpu",
        className
      )}
    >
      <nav
        className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 px-3 py-2 rounded-2xl bg-zinc-950/85 backdrop-blur-md border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.7)] transform-gpu"
        style={{ willChange: "transform" }}
      >
        {items.map((item) => {
          const isActive =
            activePath === item.path ||
            (item.path === "/" && activePath === "/dashboard");
          const Icon = item.icon;

          return (
            <div key={item.id} className="relative group flex flex-col items-center">
              {/* Ultra-fast Pure CSS Tooltip (Zero JS overhead) */}
              <div
                className="absolute -top-9 px-2 py-0.5 rounded-md bg-zinc-900/95 text-zinc-100 border border-white/15 text-[11px] font-medium tracking-wide shadow-lg whitespace-nowrap pointer-events-none z-20 backdrop-blur-sm opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-1 transition-all duration-150 ease-out transform-gpu"
              >
                {item.label}
              </div>

              <button
                onClick={() => onSelect(item)}
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-150 ease-out outline-none select-none transform-gpu active:scale-90 hover:scale-105",
                  isActive
                    ? "bg-white/15 text-white border border-white/20 shadow-inner font-semibold"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/10 hover:border hover:border-white/10",
                  item.highlight && !isActive && "text-rose-400"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-150",
                    isActive ? "text-white stroke-[2.2px] scale-105" : "text-zinc-400 group-hover:text-zinc-100",
                    item.highlight && !isActive && "text-rose-400"
                  )}
                />

                {/* Badge counter */}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white px-1 shadow-sm">
                    {item.badge}
                  </span>
                )}

                {/* Active Dot */}
                {isActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}
              </button>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
