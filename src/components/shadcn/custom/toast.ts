import { toast } from "sonner";
import { ReactNode } from "react";

type ToastVariant = "success" | "error" | "info";

interface ToastOptions {
  duration?: number;
}

export const CustomToast = (
  variant: ToastVariant,
  message: ReactNode,
  options?: ToastOptions
) => {
  const defaultDuration = variant === "error" ? 4000 : 3000;
  const duration = options?.duration || defaultDuration;

  switch (variant) {
    case "success":
      return toast.success(message, {
        duration,
        richColors: true,
        style: {
          backgroundColor: "var(--color-background)",
          color: "var(--color-foreground)",
          border: "1px solid var(--color-border)",
        },
      });

    case "error":
      return toast.error(message, {
        duration,
        richColors: true,
        style: {
          backgroundColor: "var(--color-destructive)",
          color: "var(--color-foreground)",
          border: "1px solid var(--color-destructive)",
        },
      });

    case "info":
      return toast(message, {
        duration,
        richColors: true,
        style: {
          backgroundColor: "var(--color-background)",
          color: "var(--color-foreground)",
          border: "1px solid var(--color-border)",
        },
      });

    default:
      return toast(message, { duration });
  }
};
