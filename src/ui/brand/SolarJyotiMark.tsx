import { cn } from '@/lib/utils';

type SolarJyotiMarkProps = {
  className?: string;
  title?: string;
  mono?: boolean;
};

export function SolarJyotiMark({
  className,
  title = 'JyotiAI Solar Jyoti mark',
  mono = false,
}: SolarJyotiMarkProps) {
  return (
    <svg
      className={cn('h-7 w-7 shrink-0', className)}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
    >
      <circle
        cx="32"
        cy="32"
        r="23"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.38"
      />
      <circle
        cx="32"
        cy="32"
        r="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.25"
      />
      <path
        d="M33 9c7 8 13 15 13 26 0 10-6 18-14 18S18 45 18 35c0-7 4-12 9-18-1 8 2 12 6 15 4-6 3-13 0-23Z"
        fill={mono ? 'currentColor' : '#F28C28'}
      />
      <path
        d="M32 28c4 5 6 8 6 13 0 4-3 8-6 8s-6-4-6-8c0-5 3-8 6-13Z"
        fill={mono ? 'currentColor' : '#FFF0A8'}
        opacity={mono ? '0.68' : '1'}
      />
      <circle cx="50" cy="20" r="3" fill={mono ? 'currentColor' : '#C9A24A'} />
    </svg>
  );
}
