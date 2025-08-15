import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // base
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium " +
    "transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 " +
    // smooth press + lift
    "active:scale-[0.98]",
  {
    variants: {
      variant: {
        // your existing set
        default:
          "rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "rounded-md bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "rounded-md bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost:
          "rounded-md hover:bg-accent hover:text-accent-foreground",
        link:
          "rounded-none p-0 text-primary underline-offset-4 hover:underline",

        /* ---- GLASS VARIANTS ---- */

        // Neutral frosted glass (uses surface colors; great for cards/headers)
        glass:
          "rounded-lg border border-white/20 dark:border-white/10 " +
          // translucent fill
          "bg-white/10 dark:bg-white/10 " +
          // blur + subtle inner highlight + soft drop shadow
          "backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,.15),0_8px_20px_rgba(0,0,0,.12)] " +
          // hover/active refinement
          "hover:bg-white/14 dark:hover:bg-white/14 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.2),0_12px_28px_rgba(0,0,0,.18)] " +
          // focus ring with your primary hue
          "focus-visible:ring-[hsl(var(--primary)/.35)] " +
          // ensure readable text on translucent background
          "text-foreground",

        // Tinted glass with primary hue—nice for CTAs
        glassPrimary:
          "rounded-lg border border-white/25 dark:border-white/15 " +
          // primary-tinted glass fill (reads well in both modes)
          "bg-[hsl(var(--primary)/.16)] " +
          "backdrop-blur-md " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_10px_28px_rgba(0,0,0,.20)] " +
          "hover:bg-[hsl(var(--primary)/.22)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.22),0_14px_36px_rgba(0,0,0,.26)] " +
          "focus-visible:ring-[hsl(var(--primary)/.45)] " +
          "text-white",

        // Tinted glass with accent hue—great for secondary emphasis
        glassAccent:
          "rounded-lg border border-white/25 dark:border-white/15 " +
          "bg-[hsl(var(--accent)/.18)] backdrop-blur-md " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_10px_28px_rgba(0,0,0,.18)] " +
          "hover:bg-[hsl(var(--accent)/.24)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.22),0_14px_36px_rgba(0,0,0,.24)] " +
          "focus-visible:ring-[hsl(var(--accent)/.45)] " +
          "text-white",

        // Minimal glass—transparent with a soft hover, good for toolbars
        glassGhost:
          "rounded-lg border border-white/15 dark:border-white/10 " +
          "bg-transparent backdrop-blur-sm " +
          "hover:bg-white/8 dark:hover:bg-white/8 " +
          "focus-visible:ring-[hsl(var(--ring)/.45)] " +
          "text-foreground"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6",
        xl: "h-12 rounded-lg px-8 text-base",
        icon: "h-9 w-9",
      },
      // optional: quick radius control to match your card styles
      radius: {
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
      elevation: {
        none: "",
        soft: "shadow",
        lg: "shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "md",
      elevation: "soft",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, radius, elevation, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, radius, elevation, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
