import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex w-full text-sm transition-colors placeholder:text-muted-foreground/80 " +
    "focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 " +
    "min-h-[90px]",
  {
    variants: {
      variant: {
        solid:
          "rounded-md border border-input bg-background px-3 py-2 " +
          "focus-visible:ring-[hsl(var(--ring)/.35)]",
        glass:
          "rounded-lg border border-white/20 dark:border-white/10 " +
          "bg-white/10 dark:bg-white/10 px-3 py-2 " +
          "supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:backdrop-saturate-150 " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,.12)] " +
          "focus:bg-white/14 dark:focus:bg-white/14 " +
          "focus-visible:ring-[hsl(var(--primary)/.45)]",
        glassPrimary:
          "rounded-lg border border-white/25 dark:border-white/15 " +
          "bg-[hsl(var(--primary)/.12)] px-3 py-2 " +
          "supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:backdrop-saturate-150 " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,.16)] " +
          "focus:bg-[hsl(var(--primary)/.18)] " +
          "focus-visible:ring-[hsl(var(--primary)/.55)]",
      },
      state: {
        default: "",
        error:
          "border-red-500/60 focus-visible:ring-red-500/30 focus:border-red-500/60",
        success:
          "border-emerald-500/60 focus-visible:ring-emerald-500/30 focus:border-emerald-500/60",
      },
    },
    defaultVariants: {
      variant: "solid",
      state: "default",
    },
  }
)

const Textarea = React.forwardRef(
  ({ className, variant, state, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(textareaVariants({ variant, state }), className)}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
