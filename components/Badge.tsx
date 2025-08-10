import React from 'react';
import * as FiIcons from 'react-icons/fi';

interface BadgeProps {
  badge: {
    id: string;
    name: string;
    description: string;
    icon: keyof typeof FiIcons;
  };
  earned: boolean;
}

const Badge: React.FC<BadgeProps> = ({ badge, earned }) => {
  const IconComponent = FiIcons[badge.icon] || FiIcons.FiHelpCircle;

  return (
    <div className={`flex items-center p-4 border rounded-lg ${earned ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
      <div className={`mr-4 p-3 rounded-full ${earned ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
        <IconComponent size={24} />
      </div>
      <div className="flex-1">
        <h3 className={`font-bold ${earned ? 'text-gray-800' : 'text-gray-500'}`}>
          {badge.name}
        </h3>
        <p className={`text-sm ${earned ? 'text-gray-600' : 'text-gray-400'}`}>
          {badge.description}
        </p>
      </div>
      {earned && (
        <div className="ml-4 text-yellow-500">
          <FiIcons.FiCheckCircle size={24} />
        </div>
      )}
    </div>
  );
};

export default Badge;
