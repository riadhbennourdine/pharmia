import React from 'react';
import { FiUsers, FiCheckCircle, FiStar } from 'react-icons/fi';

interface SummaryCardProps {
  icon: React.ReactElement;
  label: string;
  value: number | string;
  color: string;
}

const Card: React.FC<SummaryCardProps> = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className={`mr-4 p-3 rounded-full ${color}`}>
      {React.cloneElement(icon, { size: 24, className: 'text-white' })}
    </div>
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

interface SummaryCardsProps {
    totalUsers: number;
    premiumUsers: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ totalUsers, premiumUsers }) => {
  const cards = [
    {
      label: 'Utilisateurs Totaux',
      value: totalUsers,
      icon: <FiUsers />,
      color: 'bg-blue-500',
    },
    {
      label: 'Abonnements Premium',
      value: premiumUsers,
      icon: <FiStar />,
      color: 'bg-yellow-500',
    },
    {
        label: 'Taux de Conversion',
        value: totalUsers > 0 ? `${((premiumUsers / totalUsers) * 100).toFixed(1)}%` : '0%',
        icon: <FiCheckCircle />,
        color: 'bg-green-500',
      },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cards.map((card) => (
        <Card key={card.label} {...card} />
      ))}
    </div>
  );
};

export default SummaryCards;
