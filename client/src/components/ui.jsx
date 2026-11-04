import { Link } from 'react-router-dom';

export const btn = {
  primary: 'inline-flex items-center justify-center rounded-md bg-lotus px-4 py-2 text-sm font-medium text-white transition hover:bg-lotus-dark disabled:cursor-not-allowed disabled:opacity-60',
  secondary: 'inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-stone-50 disabled:opacity-60',
  danger: 'inline-flex items-center justify-center rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60',
};

export const inputCls = (error) =>
  `w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-lotus/30 ${error ? 'border-red-400' : 'border-stone-300 focus:border-lotus'}`;

/** Labelled form control with an inline error message. */
export function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
      {error && <span role="alert" className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
      <h3 className="font-serif text-2xl font-semibold">{title}</h3>
      <div className="mt-2 text-sm text-stone-600">{children}</div>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center">
      <p className="font-medium text-red-800">{error?.message || 'Something went wrong.'}</p>
      {onRetry && <button onClick={onRetry} className={`${btn.secondary} mt-4`}>Try again</button>}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return <p className="py-10 text-center text-sm text-stone-500" role="status">{label}</p>;
}

export function BackLink({ to, children }) {
  return <Link to={to} className="text-sm text-lotus hover:underline">← {children}</Link>;
}
