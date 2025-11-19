import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border h-14 min-h-[56px]",
  {
    variants: {
      variant: {
        default: "bg-[#F1EFEC] text-[#030303] border-[#030303] hover:bg-[#123458] hover:text-[#F1EFEC] hover:border-[#123458]",
        secondary: "bg-[#123458] text-[#F1EFEC] border-[#123458] hover:bg-[#F1EFEC] hover:text-[#030303] hover:border-[#123458]",
        active: "bg-[#123458] text-[#F1EFEC] border-[#123458] hover:bg-[#123458] hover:text-[#F1EFEC] hover:border-[#123458]",
        ghost: "bg-transparent text-[#030303] border-transparent hover:bg-[#F1EFEC] hover:border-[#030303]",
        dropdown: "bg-[#F1EFEC] text-[#030303] border-[#030303] hover:bg-[#123458] hover:text-[#F1EFEC] hover:border-[#123458]",
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
