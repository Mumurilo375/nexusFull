/* eslint-disable react-refresh/only-export-components */
import type { ComponentProps, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import type { PaginationMeta } from "../../../services/http";

const buttonClass = {
  primary:
    "rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "rounded-full border border-slate-700 bg-slate-950 px-5 py-2.5 text-sm text-gray-200 transition hover:border-blue-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60",
  danger:
    "rounded-full bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60",
  subtleDanger:
    "rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60",
} as const;
const noticeClass = {
  error:
    "rounded-md border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200",
  success:
    "rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200",
} as const;
const cx = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");
const sideCardClass =
  "rounded-[24px] border border-slate-800 bg-slate-900/55 p-5";
type ButtonTone = keyof typeof buttonClass;
type NoticeTone = keyof typeof noticeClass;
type FieldProps = {
  label: string;
  note?: ReactNode;
  className?: string;
  children: ReactNode;
};
type PageStateProps = {
  loading: boolean;
  error?: string;
  isEmpty?: boolean;
  loadingText: string;
  emptyText?: ReactNode;
  emptyClassName?: string;
  children: ReactNode;
};

export const adminFieldClass =
  "mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500/70";
export const adminBackToPanelClass =
  "border-slate-600 bg-slate-900/90 px-4 py-1.5 font-medium text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-blue-400/50 hover:bg-slate-800";
export const adminFormClass =
  "grid gap-5 rounded-[28px] border border-slate-800 bg-slate-950/78 p-6";
const Field = ({ label, note, className, children }: FieldProps) => (
  <label className={cx("text-sm text-gray-200", className)}>
    {label}
    {children}
    {note && <p className="mt-2 text-xs text-slate-400">{note}</p>}
  </label>
);

export const AdminNotice = ({
  children,
  tone = "error",
}: {
  children: ReactNode;
  tone?: NoticeTone;
}) => <p className={noticeClass[tone]}>{children}</p>;
export const AdminButton = ({
  tone = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { tone?: ButtonTone }) => (
  <button {...props} className={cx(buttonClass[tone], className)} />
);
export const AdminLinkButton = ({
  tone = "secondary",
  className,
  ...props
}: LinkProps & { tone?: ButtonTone }) => (
  <Link {...props} className={cx(buttonClass[tone], className)} />
);
export const AdminTextField = ({
  label,
  note,
  className,
  ...props
}: ComponentProps<"input"> & Omit<FieldProps, "children">) => (
  <Field label={label} note={note}>
    <input {...props} className={cx(adminFieldClass, className)} />
  </Field>
);
export const AdminTextareaField = ({
  label,
  note,
  className,
  ...props
}: ComponentProps<"textarea"> & Omit<FieldProps, "children">) => (
  <Field label={label} note={note}>
    <textarea {...props} className={cx(adminFieldClass, className)} />
  </Field>
);
export const AdminSelectField = ({
  label,
  note,
  className,
  children,
  ...props
}: ComponentProps<"select"> & FieldProps) => (
  <Field label={label} note={note}>
    <select {...props} className={cx(adminFieldClass, className)}>
      {children}
    </select>
  </Field>
);
export const AdminReadonlyField = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <Field label={label}>
    <input
      type="text"
      value={value}
      readOnly
      disabled
      className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-400"
    />
  </Field>
);
export const AdminToggleField = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label className="flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
    <span className="font-medium text-white">{label}</span>
    <span
      className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border transition ${checked ? "border-blue-400/60 bg-blue-500/25" : "border-slate-700 bg-slate-950"}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={({ target }) => onChange(target.checked)}
        className="sr-only"
      />
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${checked ? "left-6" : "left-1"}`}
      />
    </span>
  </label>
);
export const AdminSideCard = ({
  eyebrow,
  className,
  children,
}: {
  eyebrow: string;
  className?: string;
  children: ReactNode;
}) => (
  <aside className={cx(sideCardClass, className)}>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/80">
      {eyebrow}
    </p>
    {children}
  </aside>
);
export const AdminStatusBadge = ({
  active,
  activeLabel = "Ativo",
  inactiveLabel = "Inativo",
}: {
  active?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) => (
  <span
    className={`rounded-full px-3 py-1 text-xs font-semibold ${active === false ? "border border-slate-700 bg-slate-900 text-slate-300" : "border border-blue-500/20 bg-blue-500/10 text-blue-100"}`}
  >
    {active === false ? inactiveLabel : activeLabel}
  </span>
);
export function AdminPageState({
  loading,
  error,
  isEmpty = false,
  loadingText,
  emptyText,
  emptyClassName = "nexus-card p-5 text-gray-300",
  children,
}: PageStateProps) {
  if (loading) return <p className="text-gray-300">{loadingText}</p>;
  if (error) return <AdminNotice>{error}</AdminNotice>;
  if (isEmpty)
    return emptyText ? <p className={emptyClassName}>{emptyText}</p> : null;
  return children;
}
export const AdminFormActions = ({
  backTo,
  submitLabel,
  saving = false,
  disabled = false,
  cancelLabel = "Cancelar",
  savingLabel = "Salvando...",
}: {
  backTo: string;
  submitLabel: string;
  saving?: boolean;
  disabled?: boolean;
  cancelLabel?: string;
  savingLabel?: string;
}) => (
  <div className="flex flex-wrap gap-3">
    <AdminButton type="submit" disabled={saving || disabled}>
      {saving ? savingLabel : submitLabel}
    </AdminButton>
    <AdminLinkButton to={backTo}>{cancelLabel}</AdminLinkButton>
  </div>
);
export const createEmptyMeta = (limit: number): PaginationMeta => ({
  page: 1,
  limit,
  total: 0,
  totalPages: 1,
});
export const formatMoney = (value: number | string = 0) =>
  `R$ ${Number(value ?? 0).toFixed(2)}`;
export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("pt-BR") : "-";
export function formatReleaseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day
    ? new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("pt-BR", {
        timeZone: "UTC",
      })
    : "-";
}
export const getKeyStatusBadgeClass = (status: string) =>
  `inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
    status === "sold"
      ? "border border-rose-500/30 bg-rose-500/10 text-rose-200"
      : status === "reserved"
        ? "border border-amber-500/30 bg-amber-500/10 text-amber-200"
        : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
  }`;
