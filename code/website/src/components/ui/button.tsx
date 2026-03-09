import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border h-14 min-h-[56px] [border-radius:var(--radius-button)]",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border hover:bg-primary hover:text-primary-foreground hover:border-primary",
        secondary: "bg-primary text-primary-foreground border-primary hover:bg-background hover:text-foreground hover:border-primary",
        active: "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground hover:border-primary",
        ghost: "bg-transparent text-foreground border-transparent hover:bg-background hover:border-border",
        dropdown: "bg-background text-foreground border-border hover:bg-primary hover:text-primary-foreground hover:border-primary",
      },
      size: {
        default: "px-4 py-4 leading-6",
        sm: "px-3 py-4 leading-6",
        lg: "px-8 py-4 leading-6",
        icon: "w-10 py-4 leading-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
