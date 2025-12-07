// A simple vanilla JS exportable React SVG component
import React from "react";

const AVATAR_RADIUS = 12;

export default function ProjectAvatarSVG({ id = "rnd", width = 80, height = 80, ...props }) {
  // To ensure unique id if multiple used on page:
  const maskId = `mask_${id}`;
  const filterId = `filter_${id}`;

  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      {...props}
    >
      <mask
        id={maskId}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="80"
        height="80"
      >
        <rect width="80" height="80" rx={AVATAR_RADIUS} ry={AVATAR_RADIUS} fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <rect width="80" height="80" rx={AVATAR_RADIUS} ry={AVATAR_RADIUS} fill="#ff005b" />
        <path
          filter={`url(#${filterId})`}
          d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z"
          fill="#ff7d10"
          transform="translate(2 -2) rotate(74 40 40) scale(1.5)"
        />
        <path
          filter={`url(#${filterId})`}
          d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z"
          fill="#ffb238"
          transform="translate(7 7) rotate(111 40 40) scale(1.5)"
          style={{ mixBlendMode: "overlay" }}
        />
      </g>
      <defs>
        <filter
          id={filterId}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}

// Alternate palette variant
export function ProjectAvatarPurpleSVG({ id = "rna", width = 80, height = 80, ...props }) {
  const maskId = `mask_${id}`;
  const filterId = `filter_${id}`;

  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      {...props}
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
        <rect width="80" height="80" rx={AVATAR_RADIUS} ry={AVATAR_RADIUS} fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <rect width="80" height="80" rx={AVATAR_RADIUS} ry={AVATAR_RADIUS} fill="#49007e" />
        <path
          filter={`url(#${filterId})`}
          d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z"
          fill="#ff005b"
          transform="translate(-2 -2) rotate(-162 40 40) scale(1.5)"
        />
        <path
          filter={`url(#${filterId})`}
          d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z"
          fill="#ff7d10"
          transform="translate(-7 -7) rotate(-63 40 40) scale(1.5)"
          style={{ mixBlendMode: "overlay" }}
        />
      </g>
      <defs>
        <filter id={filterId} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}

// Alternate purple variant #2
export function ProjectAvatarPurpleAltSVG({ id = "rnf", width = 80, height = 80, ...props }) {
  const maskId = `mask_${id}`;
  const filterId = `filter_${id}`;

  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      {...props}
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
        <rect width="80" height="80" rx={AVATAR_RADIUS} ry={AVATAR_RADIUS} fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <rect width="80" height="80" rx={AVATAR_RADIUS} ry={AVATAR_RADIUS} fill="#49007e" />
        <path
          filter={`url(#${filterId})`}
          d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z"
          fill="#ff005b"
          transform="translate(-2 2) rotate(-82 40 40) scale(1.5)"
        />
        <path
          filter={`url(#${filterId})`}
          d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z"
          fill="#ff7d10"
          transform="translate(-7 7) rotate(-303 40 40) scale(1.5)"
          style={{ mixBlendMode: "overlay" }}
        />
      </g>
      <defs>
        <filter id={filterId} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}

// Alternate purple variant #3
export function ProjectAvatarPurpleAlt2SVG({ id = "ro0", width = 80, height = 80, ...props }) {
  const maskId = `mask_${id}`;
  const filterId = `filter_${id}`;

  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      {...props}
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
        <rect width="80" height="80" rx={AVATAR_RADIUS} ry={AVATAR_RADIUS} fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <rect width="80" height="80" rx={AVATAR_RADIUS} ry={AVATAR_RADIUS} fill="#49007e" />
        <path
          filter={`url(#${filterId})`}
          d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z"
          fill="#ff005b"
          transform="translate(0 0) rotate(152 40 40) scale(1.2)"
        />
        <path
          filter={`url(#${filterId})`}
          d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z"
          fill="#ff7d10"
          transform="translate(-4 4) rotate(-228 40 40) scale(1.2)"
          style={{ mixBlendMode: "overlay" }}
        />
      </g>
      <defs>
        <filter id={filterId} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}

// Orange variant
export function ProjectAvatarOrangeSVG({ id = "ros", width = 80, height = 80, ...props }) {
  const maskId = `mask_${id}`;
  const filterId = `filter_${id}`;

  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      {...props}
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
        <rect width="80" height="80" rx={AVATAR_RADIUS} ry={AVATAR_RADIUS} fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <rect width="80" height="80" rx={AVATAR_RADIUS} ry={AVATAR_RADIUS} fill="#ff7d10" />
        <path
          filter={`url(#${filterId})`}
          d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z"
          fill="#ffb238"
          transform="translate(-6 -6) rotate(-326 40 40) scale(1.3)"
        />
        <path
          filter={`url(#${filterId})`}
          d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z"
          fill="#0a0310"
          transform="translate(-5 -5) rotate(-309 40 40) scale(1.3)"
          style={{ mixBlendMode: "overlay" }}
        />
      </g>
      <defs>
        <filter id={filterId} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}

// Purple variant #4
export function ProjectAvatarPurpleAlt3SVG({ id = "rpt", width = 80, height = 80, ...props }) {
  const maskId = `mask_${id}`;
  const filterId = `filter_${id}`;

  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      {...props}
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
        <rect width="80" height="80" rx={AVATAR_RADIUS} ry={AVATAR_RADIUS} fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <rect width="80" height="80" rx={AVATAR_RADIUS} ry={AVATAR_RADIUS} fill="#49007e" />
        <path
          filter={`url(#${filterId})`}
          d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z"
          fill="#ff005b"
          transform="translate(-2 2) rotate(-322 40 40) scale(1.5)"
        />
        <path
          filter={`url(#${filterId})`}
          d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z"
          fill="#ff7d10"
          transform="translate(-7 7) rotate(-303 40 40) scale(1.5)"
          style={{ mixBlendMode: "overlay" }}
        />
      </g>
      <defs>
        <filter id={filterId} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}