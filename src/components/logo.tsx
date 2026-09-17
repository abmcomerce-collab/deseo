import { cn } from "@/lib/format";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline font-display italic leading-none select-none", className)}>
      deseo
      <span className="ml-[0.06em] inline-block size-[0.18em] translate-y-[-0.05em] rounded-full bg-brasa" aria-hidden />
      <span className="sr-only"> — inicio</span>
    </span>
  );
}
