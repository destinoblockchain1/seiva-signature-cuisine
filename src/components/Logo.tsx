type Props = {
  subtext?: string;
  size?: "sm" | "md" | "lg";
  align?: "start" | "center";
  className?: string;
};

const sizes = {
  sm: { word: "text-lg", track: "tracking-[0.45em]", sub: "text-[0.55rem] tracking-[0.3em]", icon: 14, gap: "gap-2" },
  md: { word: "text-2xl", track: "tracking-[0.5em]", sub: "text-[0.6rem] tracking-[0.32em]", icon: 18, gap: "gap-3" },
  lg: { word: "text-5xl md:text-6xl", track: "tracking-[0.55em]", sub: "text-xs tracking-[0.4em]", icon: 28, gap: "gap-4" },
};

export function TriadIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      className={className}
      aria-hidden
    >
      {/* Three equal horizontal lines — horizontal triad */}
      <line x1="4" y1="11" x2="28" y2="11" strokeWidth="1" />
      <line x1="4" y1="16" x2="28" y2="16" strokeWidth="1" />
      <line x1="4" y1="21" x2="28" y2="21" strokeWidth="1" />
      {/* Abstract sap-drop / botanical: leaf-drop shape centered */}
      <path
        d="M16 6 C 12.5 11.5, 12.5 20.5, 16 26 C 19.5 20.5, 19.5 11.5, 16 6 Z"
        strokeWidth="0.9"
        fill="currentColor"
        fillOpacity="0.08"
      />
    </svg>
  );
}

export function Logo({ subtext = "SEIVA • SIGNATURE CUISINE", size = "md", align = "center", className = "" }: Props) {
  const s = sizes[size];
  const alignCls = align === "center" ? "items-center" : "items-start";
  return (
    <div className={`flex flex-col ${alignCls} ${className}`}>
      <div className={`flex items-center ${s.gap}`}>
        <TriadIcon size={s.icon} className="text-current opacity-90" />
        <span className={`font-serif ${s.word} ${s.track} leading-none`}>SEIVA</span>
        <TriadIcon size={s.icon} className="rotate-180 text-current opacity-90" />
      </div>
      {subtext && (
        <span className={`mt-2 font-sans ${s.sub} uppercase opacity-70`}>{subtext}</span>
      )}
    </div>
  );
}
