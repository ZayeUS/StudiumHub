import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* Card variants: solid + multiple glass tints */
const cardVariants = cva(
  "relative transition-all will-change-transform text-card-foreground",
  {
    variants: {
      variant: {
        // Default solid surface (uses your theme tokens)
        solid:
          "rounded-xl border bg-card shadow",

        // Neutral frosted glass (great for dashboards/overlays)
        glass:
          "rounded-xl border border-white/20 dark:border-white/10 " +
          "bg-white/10 dark:bg-white/10 " +
          "supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:backdrop-saturate-150 " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_8px_24px_rgba(0,0,0,.12)] " +
          "hover:shadow-[inset_0_1px_0_rgba(255,255,255,.16),0_12px_28px_rgba(0,0,0,.16)]",

        // Primary-tinted glass (subtle brand halo)
        glassPrimary:
          "rounded-xl border border-white/25 dark:border-white/15 " +
          "bg-[hsl(var(--primary)/.14)] " +
          "supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:backdrop-saturate-150 " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_10px_28px_rgba(0,0,0,.18)] " +
          "hover:bg-[hsl(var(--primary)/.18)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_14px_36px_rgba(0,0,0,.22)]",

        // Accent-tinted glass (use for secondary emphasis areas)
        glassAccent:
          "rounded-xl border border-white/25 dark:border-white/15 " +
          "bg-[hsl(var(--accent)/.16)] " +
          "supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:backdrop-saturate-150 " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_10px_28px_rgba(0,0,0,.18)] " +
          "hover:bg-[hsl(var(--accent)/.2)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_14px_36px_rgba(0,0,0,.22)]",
      },
      elevation: {
        none: "",
        sm: "shadow-sm",
        md: "shadow",
        lg: "shadow-lg",
      },
      radius: {
        md: "rounded-md",
        xl: "rounded-xl",
        full: "rounded-3xl",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      interactive: {
        false: "",
        true:
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-[hsl(var(--ring)/.5)] " +
          "hover:translate-y-[.5px] active:translate-y-[1px]",
      },
    },
    defaultVariants: {
      variant: "solid",
      elevation: "md",
      radius: "xl",
      padding: "md",
      interactive: false,
    },
  }
)

const Card = React.forwardRef(
  ({ className, variant, elevation, radius, padding, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, elevation, radius, padding, interactive }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

/* Subcomponents keep your existing spacing/typography, just swap base to inherit glass bg */
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 px-6 pt-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 pb-6 pt-4", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center px-6 pb-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
