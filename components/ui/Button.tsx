import Link from "next/link";
import { Loader2, type LucideIcon } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "text";

type CommonProps = {
  variant?: ButtonVariant;
  size?: "md" | "lg";
  /** Icône Lucide affichée avant le libellé */
  icon?: LucideIcon;
  iconPosition?: "start" | "end";
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-semibold whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out " +
  "active:scale-[0.98] disabled:active:scale-100 disabled:cursor-not-allowed aria-disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-action text-on-action border-2 border-action hover:bg-action-hover hover:border-action-hover " +
    "disabled:opacity-45 disabled:hover:bg-action disabled:hover:border-action",
  secondary:
    "bg-surface text-ink border-2 border-action hover:bg-action-tint " +
    "disabled:opacity-45 disabled:hover:bg-surface",
  text:
    "bg-transparent text-ink border-2 border-transparent underline-offset-4 hover:bg-action-tint " +
    "disabled:opacity-45 disabled:hover:bg-transparent",
};

const sizes = {
  md: "min-h-11 px-5 text-[15px]",
  lg: "min-h-12 px-6 text-body",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: Pick<CommonProps, "variant" | "size" | "fullWidth" | "className">) {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
}

function Content({ icon: Icon, iconPosition = "start", loading, children }: CommonProps) {
  return (
    <>
      {loading ? (
        <Loader2 aria-hidden className="size-5 animate-spin" strokeWidth={2} />
      ) : (
        Icon && iconPosition === "start" && <Icon aria-hidden className="size-5 shrink-0" strokeWidth={2} />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === "end" && (
        <Icon aria-hidden className="size-5 shrink-0" strokeWidth={2} />
      )}
    </>
  );
}

export const Button = forwardRef<
  HTMLButtonElement,
  CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">
>(function Button(
  { variant, size, icon, iconPosition, loading, fullWidth, className, children, disabled, type = "button", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      <Content icon={icon} iconPosition={iconPosition} loading={loading}>
        {children}
      </Content>
    </button>
  );
});

export function ButtonLink({
  href,
  variant,
  size,
  icon,
  iconPosition,
  fullWidth,
  className,
  children,
  ...rest
}: CommonProps & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children">) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      <Content icon={icon} iconPosition={iconPosition}>
        {children}
      </Content>
    </Link>
  );
}
