import { useId } from 'react';

export default function OmniFlowMark({ className, style }) {
  const gradientId = useId().replace(/:/g, '');

  return (
    <svg
      width="92"
      height="92"
      viewBox="0 0 92 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="20"
          y1="14"
          x2="76"
          y2="78"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1E3A8A" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="88" height="88" rx="24" fill="#EEF2FF" />
      <rect
        x="14"
        y="20"
        width="34"
        height="52"
        rx="12"
        fill={`url(#${gradientId})`}
      />
      <rect x="23" y="29" width="16" height="34" rx="6" fill="#EEF2FF" />
      <rect
        x="52"
        y="20"
        width="10"
        height="52"
        rx="5"
        fill={`url(#${gradientId})`}
      />
      <rect
        x="52"
        y="20"
        width="24"
        height="10"
        rx="5"
        fill={`url(#${gradientId})`}
      />
      <rect
        x="52"
        y="39"
        width="20"
        height="10"
        rx="5"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M63 63L69.5 69.5L82 55"
        stroke="#22C55E"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
