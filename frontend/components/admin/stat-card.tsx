import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: LucideIcon;
  color: string;
}

export function StatCard({ title, value, change, positive, icon: Icon, color }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-800 font-serif">{value}</p>
          <p className={`mt-1 text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
            {positive ? '▲' : '▼'} {change} <span className="text-gray-400 font-normal">vs kemarin</span>
          </p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}
