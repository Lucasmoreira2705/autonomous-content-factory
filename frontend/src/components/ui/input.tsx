import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400/50",
        className,
      )}
      {...props}
    />
  );
}
