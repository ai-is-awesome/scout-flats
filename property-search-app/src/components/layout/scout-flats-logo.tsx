import type { SVGProps } from "react";

type ScoutFlatsLogoProps = Omit<SVGProps<SVGSVGElement>, "viewBox"> & {
  className?: string;
};

export function ScoutFlatsLogo({
  className = "h-9 w-auto",
  ...props
}: ScoutFlatsLogoProps) {
  return (
    <svg
      className={className}
      width="220"
      height="60"
      viewBox="0 0 220 60"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      {...props}
    >
      <g transform="translate(5,5)">
        <path
          d="M20 0C11 0 4 7 4 16c0 11 16 28 16 28s16-17 16-28C36 7 29 0 20 0z"
          fill="#FF7A00"
        />
        <path
          d="M14 22v-6l6-5 6 5v6h-4v-4h-4v4h-4z"
          fill="white"
        />
      </g>
      <text
        x="60"
        y="38"
        fontFamily="system-ui, -apple-system, Segoe UI, Arial, sans-serif"
        fontSize="26"
        fontWeight="600"
        className="fill-foreground"
      >
        Scout
      </text>
      <text
        x="140"
        y="38"
        fontFamily="system-ui, -apple-system, Segoe UI, Arial, sans-serif"
        fontSize="26"
        fontWeight="600"
        fill="#FF7A00"
      >
        Flats
      </text>
    </svg>
  );
}
