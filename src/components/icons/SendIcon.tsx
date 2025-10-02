import * as React from "react";

type Props = React.SVGProps<SVGSVGElement>;

export default function SendIcon({
    width = 20,
    height = 20,
    ...props
  }: Props) {
  return (
    <svg
      style={{ width, height, ...props.style }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        d="M22.2134 2.97092L16.7601 22.0572C16.6092 22.5856 16.2846 22.6096 16.043 22.1266L11.4867 13.014L2.4096 9.38317C1.89992 9.1793 1.90623 8.8742 2.44365 8.69506L21.5299 2.33299C22.0583 2.15683 22.3614 2.45264 22.2134 2.97092ZM19.522 5.11045L7.29891 9.18483L12.9355 11.4395L15.9762 17.5208L19.522 5.11045Z"
        fill="#7B7252"
        strokeWidth="1.8"
        strokeLinejoin="round"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}