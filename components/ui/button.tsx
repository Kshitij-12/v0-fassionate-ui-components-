"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ✅ Lightweight Slot fallback — NO external deps
function SlotPolyfill({ children, ...props }: any) {
  const child = React.Children.only(children) as React.ReactElement | null
  if (!child) return null
  return React.cloneElement(child, { ...props, ...child.props })
}

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-700/30 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-white/5 text-white hover:bg-white/10",
        ghost: "bg-transparent hover:bg-white/10",
      },
      size: {
        default: "h-10 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const Comp: any = asChild ? SlotPolyfill : "button"

  // ✅ Safe ARIA fallback
  const ariaLabel = (props as any)["aria-label"] ?? (children ? undefined : "Primary action")

  return (
    <Comp
      aria-label={ariaLabel}
      className={cn(buttonVariants({ variant, size, className }))}
      {...(props as any)}
    >
      {children}
    </Comp>
  )
}
