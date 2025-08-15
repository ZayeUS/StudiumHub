import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full text-sm transition-colors placeholder:text-muted-foreground/80 " +
    "focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        // standard shadcn feel (kept for forms that shouldn’t be glass)
        solid:
          "rounded-md border border-input bg-background px-3 py-2 " +
          "focus-visible:ring-[hsl(var(--ring)/.35)]",
        // frosted neutral glass
        glass:
          "rounded-lg border border-white/20 dark:border-white/10 " +
          "bg-white/10 dark:bg-white/10 px-3 py-2 " +
          "supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:backdrop-saturate-150 " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,.12)] " +
          "focus:bg-white/14 dark:focus:bg-white/14 " +
          "focus-visible:ring-[hsl(var(--primary)/.45)]",
        // primary-tinted glass (nice for search bars / hero forms)
        glassPrimary:
          "rounded-lg border border-white/25 dark:border-white/15 " +
          "bg-[hsl(var(--primary)/.12)] px-3 py-2 " +
          "supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:backdrop-saturate-150 " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,.16)] " +
          "focus:bg-[hsl(var(--primary)/.18)] " +
          "focus-visible:ring-[hsl(var(--primary)/.55)]",
        // super light glass for toolbars
        glassGhost:
          "rounded-lg border border-white/15 bg-transparent px-3 py-2 " +
          "supports-[backdrop-filter]:backdrop-blur-sm " +
          "hover:bg-white/6 dark:hover:bg-white/6 " +
          "focus-visible:ring-[hsl(var(--ring)/.45)]",
      },
      size: {
        sm: "h-8 text-xs",
        md: "h-10",
        lg: "h-12 text-base",
      },
      state: {
        default: "",
        error:
          "border-red-500/60 focus-visible:ring-red-500/30 " +
          "focus:border-red-500/60",
        success:
          "border-emerald-500/60 focus-visible:ring-emerald-500/30 " +
          "focus:border-emerald-500/60",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
      state: "default",
    },
  }
)

const Input = React.forwardRef(
  ({ className, variant, size, state, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputVariants({ variant, size, state }), className)}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
