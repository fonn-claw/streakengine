import clsx from "clsx";
import { type HTMLAttributes } from "react";

interface PixelCardProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section";
}

export function PixelCard({
  as: Tag = "div",
  className,
  children,
  ...props
}: PixelCardProps) {
  return (
    <Tag
      className={clsx(
        "bg-surface pixel-border p-4",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export default PixelCard;
