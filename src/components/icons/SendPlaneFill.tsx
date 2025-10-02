
import * as React from "react";

type Props = React.SVGProps<SVGSVGElement>;

export default function SendPlaneFill({
  width = 35,
  height = 35,
  ...props
}: Props) {
  return (
    <svg 
    style={{ width, height, ...props.style }}
    viewBox="0 0 35 35" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    >
        <path 
        d="M2.83807 13.585C2.07603 13.331 2.07001 12.9211 2.85375 12.6599L30.6878 3.38188C31.4585 3.12498 31.9005 3.55637 31.6845 4.31219L23.7319 32.1463C23.5117 32.9169 23.0675 32.9437 22.7419 32.2111L17.4999 20.4167L26.2499 8.75006L14.5833 17.5L2.83807 13.585Z" 
        fill="currentColor"/>
    </svg>

  );
}