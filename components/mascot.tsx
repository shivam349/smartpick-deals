import React from "react";

interface MascotProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  badgeText?: string;
}

/**
 * Geometric Brand Avatar / Reviewer Mascot for SmartPick.
 * Reinforces "Independent Human Reviewers" for affiliate network compliance & user trust.
 */
export function ReviewerMascot({
  size = "md",
  className = "",
  badgeText = "Human Verified",
}: MascotProps) {
  const pixelSize = {
    sm: 36,
    md: 48,
    lg: 64,
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className="relative shrink-0 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-2 shadow-sm border border-indigo-900/60 overflow-hidden flex items-center justify-center group"
        style={{ width: pixelSize, height: pixelSize }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform duration-300 group-hover:scale-110"
        >
          {/* Subtle backdrop circle */}
          <circle cx="32" cy="32" r="28" fill="#1e1b4b" opacity="0.4" />

          {/* Geometric reviewer head/shoulders */}
          <path
            d="M18 52 C18 42, 24 38, 32 38 C40 38, 46 42, 46 52"
            stroke="#94a3b8"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Head */}
          <circle cx="32" cy="24" r="11" fill="#f8fafc" stroke="#312e81" strokeWidth="2.5" />

          {/* Focus visor / analysis lens in warm amber */}
          <rect x="23" y="20" width="18" height="7" rx="3.5" fill="#f59e0b" />
          <circle cx="28" cy="23.5" r="1.5" fill="#ffffff" />
          <circle cx="36" cy="23.5" r="1.5" fill="#ffffff" />

          {/* Checkmark antenna / verification node */}
          <path d="M32 13 L32 7" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="32" cy="6" r="3" fill="#fbbf24" className="animate-pulse" />
        </svg>

        {/* Status indicator dot */}
        <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
      </div>

      {badgeText && (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1">
            <span>{badgeText}</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Editorial Testing Desk</span>
        </div>
      )}
    </div>
  );
}
