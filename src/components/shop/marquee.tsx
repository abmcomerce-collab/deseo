import { cn } from "@/lib/format";

export function Marquee({
  items,
  className,
  itemClassName,
  separator = "✳",
  reverse = false,
}: {
  items: string[];
  className?: string;
  itemClassName?: string;
  separator?: string;
  reverse?: boolean;
}) {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <span key={i} className={cn("flex items-center whitespace-nowrap", itemClassName)}>
          {t}
          <span className="mx-[0.6em] opacity-60">{separator}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={cn("flex overflow-hidden", className)}>
      <div
        className="flex w-max animate-marquee motion-reduce:animate-none"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {row(false)}
        {row(true)}
        {row(true)}
        {row(true)}
      </div>
    </div>
  );
}
