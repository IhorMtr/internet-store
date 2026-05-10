"use client";

import { Toaster } from "react-hot-toast";

// ===================== COMPONENT =====================

export function ToastProvider() {
  // ===================== RENDER =====================

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className:
          "border border-border bg-surface text-primary shadow-lifted text-body",
        error: {
          iconTheme: {
            primary: "var(--ds-color-danger)",
            secondary: "var(--ds-color-surface)",
          },
        },
        success: {
          iconTheme: {
            primary: "var(--ds-color-accent)",
            secondary: "var(--ds-color-surface)",
          },
        },
      }}
    />
  );
}
