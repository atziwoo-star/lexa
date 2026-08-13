export function OrbitaMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="512" height="512" rx="112" fill="#17181D" />
      <circle
        cx="256"
        cy="256"
        r="150"
        fill="none"
        stroke="#8B5CF6"
        strokeWidth="10"
        opacity="0.35"
      />
      <circle cx="126" cy="331" r="40" fill="#B39DFF" />
      <circle cx="386" cy="331" r="44" fill="#8B5CF6" />
      <circle cx="256" cy="106" r="48" fill="#8B5CF6" />
    </svg>
  );
}
