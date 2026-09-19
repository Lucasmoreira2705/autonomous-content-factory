import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.04em]",
  {
    variants: {
      variant: {
        neutral: "bg-slate-800 text-slate-400",
        green: "bg-emerald-400/10 text-emerald-300",
        blue: "bg-blue-400/10 text-blue-300",
        amber: "bg-amber-400/10 text-amber-200",
        purple: "bg-violet-400/10 text-violet-300",
        red: "bg-red-400/10 text-red-300",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
