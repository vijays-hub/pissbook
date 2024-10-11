import { forwardRef, useState } from "react";
import { Input, InputProps } from "./ui/input";
import { cn } from "@/lib/utils";

const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          //   Open the definition of `cn` and get to know about the `cn` function
          className={cn("pe-10", className)}
          ref={ref}
          {...props}
        />

        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          title={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
