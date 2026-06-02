/**
 * Decorative organic blob background inspired by Shoppe design.
 * Uses semantic tokens (primary + accent) so it inherits SooqKabro palette.
 */
type Props = {
  variant?: "top" | "side" | "minimal";
  className?: string;
};

const AuthBlobs = ({ variant = "top", className = "" }: Props) => {
  if (variant === "minimal") {
    return (
      <div className={`pointer-events-none absolute inset-x-0 top-0 z-0 h-48 overflow-hidden ${className}`}>
        <svg viewBox="0 0 390 200" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M0,0 L390,0 L390,120 C300,180 200,40 90,140 C50,170 20,150 0,180 Z"
            fill="hsl(var(--primary))"
            opacity="0.95"
          />
          <path
            d="M0,0 L260,0 C230,80 180,60 120,120 C70,160 30,130 0,160 Z"
            fill="hsl(var(--accent))"
          />
        </svg>
      </div>
    );
  }

  if (variant === "side") {
    return (
      <div className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}>
        <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <path
            d="M390,0 L390,400 C320,420 280,300 250,200 C220,80 320,40 390,0 Z"
            fill="hsl(var(--primary))"
            opacity="0.9"
          />
          <path
            d="M390,200 C340,260 360,360 390,420 L390,200 Z"
            fill="hsl(var(--accent))"
          />
        </svg>
      </div>
    );
  }

  // top (default) — large organic blob covering ~45% of screen, used on Login & Hello-* screens
  return (
    <div className={`pointer-events-none absolute inset-x-0 top-0 z-0 h-[55%] overflow-hidden ${className}`}>
      <svg viewBox="0 0 390 500" preserveAspectRatio="none" className="h-full w-full">
        {/* Light accent blob */}
        <path
          d="M0,0 L390,0 L390,260 C310,360 240,200 150,300 C80,380 30,300 0,360 Z"
          fill="hsl(var(--accent))"
        />
        {/* Primary blob on top */}
        <path
          d="M0,0 L320,0 C300,120 220,100 160,200 C110,280 50,220 0,280 Z"
          fill="hsl(var(--primary))"
        />
        {/* Small floating accent bottom-right */}
        <ellipse cx="370" cy="380" rx="60" ry="80" fill="hsl(var(--primary))" opacity="0.85" />
      </svg>
    </div>
  );
};

export default AuthBlobs;
