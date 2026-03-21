import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

const colorVariants = {
  blue: 'bg-blue-50 border-blue-200 text-blue-900',
  green: 'bg-green-50 border-green-200 text-green-900',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  purple: 'bg-purple-50 border-purple-200 text-purple-900',
  red: 'bg-red-50 border-red-200 text-red-900',
};

const iconBgVariants = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  purple: 'bg-purple-100 text-purple-600',
  red: 'bg-red-100 text-red-600',
};

export function MetricCard({ title, value, subtitle, trend, trendValue, icon, color }: MetricCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${colorVariants[color]} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs opacity-70 mt-0.5">{subtitle}</p>}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
              {trend === 'neutral' && <Minus className="w-3 h-3 text-gray-500" />}
              <span className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg ${iconBgVariants[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
