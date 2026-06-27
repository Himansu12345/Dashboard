type AppToastProps = {
  toast: {
    type: "success" | "error";
    message: string;
  } | null;
};

export function AppToast({ toast }: AppToastProps) {
  if (!toast) return null;

  return (
    <div
      className={`app-toast ${toast.type === "success" ? "is-success" : "is-error"}`}
      role="status"
      aria-live="polite"
    >
      {toast.message}
    </div>
  );
}
