import { InputHTMLAttributes, LabelHTMLAttributes, ButtonHTMLAttributes, forwardRef } from "react";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-brand-900">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : hint ? (
        <p className="text-xs text-brand-500">{hint}</p>
      ) : null}
    </div>
  );
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextInput(props, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={
          "w-full rounded-lg border border-brand-100 bg-white px-3.5 py-2.5 text-brand-900 shadow-sm " +
          "placeholder:text-brand-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 " +
          "disabled:cursor-not-allowed disabled:opacity-60 " +
          (props.className ?? "")
        }
      />
    );
  },
);

export function PrimaryButton({
  loading,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={
        "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 " +
        "text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 " +
        "disabled:cursor-not-allowed disabled:opacity-60 " +
        (props.className ?? "")
      }
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function SecondaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-brand-200 bg-white px-4 py-2.5 " +
        "text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50 " +
        "disabled:cursor-not-allowed disabled:opacity-60 " +
        (props.className ?? "")
      }
    />
  );
}

export function LinkButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "text-sm font-medium text-brand-600 underline-offset-2 hover:underline " +
        "disabled:cursor-not-allowed disabled:opacity-50 " +
        (props.className ?? "")
      }
    />
  );
}

export function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function Alert({ kind = "error", children }: { kind?: "error" | "success" | "info"; children: React.ReactNode }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-brand-200 bg-brand-50 text-brand-700",
    info: "border-gold-400/40 bg-gold-400/10 text-gold-600",
  } as const;

  return (
    <div role="status" className={`rounded-lg border px-3.5 py-2.5 text-sm ${styles[kind]}`}>
      {children}
    </div>
  );
}

export function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-sand-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-sand-200 bg-white p-8 shadow-sm">
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gold-600">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-bold text-brand-900">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-brand-500">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-6 border-t border-sand-200 pt-5 text-sm">{footer}</div> : null}
      </div>
    </div>
  );
}
