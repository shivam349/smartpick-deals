import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "target-s" | "lens-check" | "arrow-pick";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showWordmark?: boolean;
  className?: string;
}

/**
 * Hand-crafted SVG Logomark for SmartPick.
 * Concept: Monoline geometric "S" precision-crafted with a target viewfinder & checkmark node.
 * Color: Two-tone gradient from Deep Indigo (#1e1b4b -> #4f46e5) to Warm Amber-Coral (#f59e0b -> #f97316).
 */
export function Logo({
  variant = "target-s",
  size = "md",
  animated = false,
  showWordmark = true,
  className = "",
}: LogoProps) {
  const dimensions = {
    sm: { icon: 28, text: "text-base", sub: "text-[9px]" },
    md: { icon: 34, text: "text-lg", sub: "text-[10px]" },
    lg: { icon: 44, text: "text-2xl", sub: "text-xs" },
  }[size];

  const renderIcon = () => {
    if (variant === "lens-check") {
      // Concept A: Curated Lens + Verification Checkmark
      return (
        <svg
          width={dimensions.icon}
          height={dimensions.icon}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${animated ? "logo-animated" : ""}`}
        >
          <defs>
            <linearGradient id="lensGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="55%" stopColor="#4338ca" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#4338ca" floodOpacity="0.25" />
            </filter>
          </defs>
          <circle cx="18" cy="18" r="13" stroke="url(#lensGrad)" strokeWidth="3" fill="none" filter="url(#softGlow)" />
          <path d="M28 28L36 36" stroke="url(#lensGrad)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M12 18L16.5 22.5L24 13.5" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    if (variant === "arrow-pick") {
      // Concept C: Minimalist Arrow Precision Pick
      return (
        <svg
          width={dimensions.icon}
          height={dimensions.icon}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${animated ? "logo-animated" : ""}`}
        >
          <defs>
            <linearGradient id="arrowGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <path
            d="M8 20L20 8L32 20L25 20L25 32L15 32L15 20L8 20Z"
            stroke="url(#arrowGrad)"
            strokeWidth="2.5"
            fill="none"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="20" r="3" fill="#f59e0b" />
        </svg>
      );
    }

    // Default Concept B: Monoline Geometric "S" with Precision Viewfinder
    return (
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${animated ? "logo-animated" : ""}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="smartPickIndigoAmber" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="35%" stopColor="#312e81" />
            <stop offset="75%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="amberAccent" x1="16" y1="16" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <filter id="logoGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#312e81" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Outer subtle rounded boundary */}
        <rect
          x="3"
          y="3"
          width="34"
          height="34"
          rx="10"
          fill="#fafafa"
          stroke="url(#smartPickIndigoAmber)"
          strokeWidth="1.75"
          filter="url(#logoGlow)"
        />

        {/* Continuous precision monoline "S" curve */}
        <path
          className="logo-draw-path"
          d="M 27 13.5 C 25.5 10.5 21.5 9.5 17.5 11 C 13.5 12.5 12.5 16.5 14 19.5 C 15.5 22.5 24.5 22 25.5 25.5 C 26.5 29 23.5 32 18.5 31 C 14.5 30 13 27 13 27"
          stroke="url(#smartPickIndigoAmber)"
          strokeWidth="3.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Viewfinder target diamond / selection nodule */}
        <circle cx="28" cy="12" r="3.25" fill="url(#amberAccent)" />
        <circle cx="12" cy="28" r="2.25" fill="#4f46e5" />
      </svg>
    );
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {renderIcon()}

      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-tight text-slate-950 font-display ${dimensions.text}`}>
            Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-indigo-600 to-amber-600 font-extrabold">Pick</span>
          </span>
          <span className={`font-semibold uppercase tracking-wider text-slate-500 font-mono mt-0.5 ${dimensions.sub}`}>
            Verified Reviews Desk
          </span>
        </div>
      )}
    </div>
  );
}
