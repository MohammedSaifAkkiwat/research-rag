import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "default", duration = 5000, action }) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, title, description, variant, action }]);
      if (duration !== Infinity) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toasts,
      toast,
      dismiss,
      success: (title, description, opts) => toast({ title, description, variant: "success", ...opts }),
      error: (title, description, opts) => toast({ title, description, variant: "error", ...opts }),
      info: (title, description, opts) => toast({ title, description, variant: "info", ...opts }),
    }),
    [toasts, toast, dismiss]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
