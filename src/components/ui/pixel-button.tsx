import clsx from "clsx";
import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";
type Size = "sm" | "md" | "lg";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-primary text-white border-primary hover:brightness-110",
  secondary:
    "bg-surface-raised text-secondary border-secondary hover:brightness-110",
  danger:
    "bg-danger text-white border-danger hover:brightness-110",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function PixelButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: PixelButtonProps) {
  return (
    <button
      className={clsx(
        "border-3 border-solid font-body cursor-pointer active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default PixelButton;
