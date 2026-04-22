'use client';

import React from 'react';

export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-5 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-full lg:max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">{description}</p>
      </div>

      {actions ? <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:shrink-0 lg:justify-end">{actions}</div> : null}
    </div>
  );
}