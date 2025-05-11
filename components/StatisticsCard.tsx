// components/ui/StatisticCard.jsx
import { ComponentType } from 'react';

interface StatisticCardProps {
  color: string;
  icon: ComponentType<{ className?: string }>;
  value: string;
  title: string;
  description: string;
}

export const StatisticCard = ({
  color,
  icon: Icon,
  value,
  title,
  description
}: StatisticCardProps) => (
  <div className="bg-white rounded-xl shadow-sm p-8 text-center relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
    <div className={`absolute top-0 left-0 w-full h-1 bg-${color}-600`}></div>
    <div className={`bg-${color}-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6`}>
      <Icon className={`h-8 w-8 text-${color}-600`} />
    </div>
    <div className={`text-${color}-600 text-4xl font-bold mb-3`}>{value}</div>
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default StatisticCard;