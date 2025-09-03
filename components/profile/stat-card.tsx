import { ReactNode } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  className?: string;
}

export function StatCard({ 
  icon, 
  label, 
  value, 
  change, 
  changeType = 'neutral',
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-lg border p-4 shadow-sm',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-gray-50">
          {icon}
        </div>
        {change && (
          <span className={cn(
            'inline-flex items-center text-xs font-medium px-2 py-1 rounded-full',
            changeType === 'increase' && 'text-green-700 bg-green-50',
            changeType === 'decrease' && 'text-red-700 bg-red-50',
            changeType === 'neutral' && 'text-gray-700 bg-gray-50',
          )}>
            {changeType === 'increase' && <ArrowUp className="h-3 w-3 mr-1" />}
            {changeType === 'decrease' && <ArrowDown className="h-3 w-3 mr-1" />}
            {changeType === 'neutral' && <Minus className="h-3 w-3 mr-1" />}
            {change}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
