'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const accentStyles = {
  teal: 'bg-slate-950 text-white ring-1 ring-slate-900',
  emerald: 'bg-slate-100 text-slate-900 ring-1 ring-slate-200',
  amber: 'bg-slate-200 text-slate-900 ring-1 ring-slate-300',
  slate: 'bg-white text-slate-900 ring-1 ring-slate-200',
} as const;

export default function AdminMetricCard({
  title,
  value,
  hint,
  icon,
  accent = 'teal',
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  accent?: keyof typeof accentStyles;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        {icon ? (
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', accentStyles[accent])}>{icon}</div>
        ) : null}
      </div>

      {hint ? <p className="text-sm text-slate-500">{hint}</p> : null}
    </div>
  );
}