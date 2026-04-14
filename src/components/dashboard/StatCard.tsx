import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-center mb-4">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      {trend && <span className="text-xs font-semibold text-emerald-500">{trend}</span>}
    </div>
    <div className="text-3xl font-bold text-gray-900">{value}</div>
  </div>
);