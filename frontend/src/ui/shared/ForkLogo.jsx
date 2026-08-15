import React from "react";

/**
 * ForkTalent White / Scalable Vector Logo Icon
 * Accurately models the Git Fork branch node geometry.
 */
export default function ForkLogo({
  className = "w-5 h-5 text-white",
  size,
  color = "currentColor",
  ...props
}) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      style={style}
      aria-label="ForkTalent Logo"
      {...props}
    >
      {/* Main Vertical Trunk */}
      <line
        x1="37.5"
        y1="21"
        x2="37.5"
        y2="79"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* Curved Fork Branch */}
      <path
        d="M 37.5 60.5 H 46 C 55.1 60.5 62.5 53.1 62.5 44 V 38"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Nodes / Circles */}
      <circle cx="37.5" cy="21" r="8.5" fill={color} />
      <circle cx="37.5" cy="79" r="8.5" fill={color} />
      <circle cx="62.5" cy="38" r="8.5" fill={color} />
    </svg>
  );
}
