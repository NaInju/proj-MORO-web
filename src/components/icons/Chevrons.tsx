
type Props = {
  count?: number;        // 쉐브론 줄 개수 (기본 3)
  color?: string;        // 선 색
  stroke?: number;       // 선 두께
  spacing?: number;      // 줄 사이 간격
};

export default function Chevrons({
  count = 3,
  color = "#81775F",
  stroke = 5,
  spacing = 26,
}: Props) {
  const paths = Array.from({ length: count }, (_, i) => {
    const y = 28 + i * spacing; // 시작 Y 좌표
    return (
      <path
        key={i}
        d={`M20 ${y} L50 ${y + 14} L80 ${y}`}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
    );
  });

  return (
    <svg
      className="chevrons"
      width="50"
      height={count * spacing + 20} // 높이를 줄 수에 맞게 계산
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {paths}
    </svg>
  );
}