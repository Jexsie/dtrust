/**
 * Button Component for Issuer Portal
 *
 * A versatile button component with multiple variants:
 * - default: Solid green background (primary actions)
 * - destructive: Solid red background (critical actions)
 * - outline: Transparent with colored border (secondary actions)
 */

import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline";
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "default",
      children,
      isLoading,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      default:
        "bg-[#059669] text-white hover:bg-[#047857] focus:ring-[#059669] shadow-sm",
      destructive:
        "bg-[#e11d48] text-white hover:bg-[#be123c] focus:ring-[#e11d48] shadow-sm",
      outline:
        "bg-transparent border-2 border-[#059669] text-[#059669] hover:bg-[#059669] hover:text-white focus:ring-[#059669]",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
