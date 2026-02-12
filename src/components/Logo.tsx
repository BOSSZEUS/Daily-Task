interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 40, className = "" }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      width={size}
      height={size}
      className={className}
    >
      {/* Rounded square background */}
      <rect width="48" height="48" rx="12" fill="#18181B" />
      {/* Checkmark — the "win" */}
      <path
        d="M14 28l7 7 13-18"
        stroke="#FAFAFA"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* List lines — the "tracker" */}
      <line
        x1="14"
        y1="14"
        x2="26"
        y2="14"
        stroke="#71717A"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <line
        x1="14"
        y1="20"
        x2="22"
        y2="20"
        stroke="#71717A"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <line
        x1="30"
        y1="14"
        x2="34"
        y2="14"
        stroke="#A1A1AA"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
