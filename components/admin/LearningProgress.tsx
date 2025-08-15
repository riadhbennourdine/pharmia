import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { User } from '../../types/user';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface LearningProgressProps {
  users: User[];
  loading: boolean;
  error: string | null;
}

const LearningProgress: React.FC<LearningProgressProps> = ({ users, loading, error }) => {
  if (loading) {
    return <div className="text-center p-8">Chargement des données d'apprentissage...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  const fichesReadData = {
    labels: ['Fiches Lues', 'Fiches non lues'],
    datasets: [
      {
        data: [
          users.reduce((acc, user) => acc + (user.readFicheIds?.length || 0), 0),
          // This is a simplified calculation. A more accurate one would need the total number of fiches.
          users.length * 10 - users.reduce((acc, user) => acc + (user.readFicheIds?.length || 0), 0),
        ],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  const quizScoresData = {
    labels: users.map(user => user.username),
    datasets: [
      {
        label: 'Score Moyen au Quiz',
        data: users.map(user => user.averageQuizScore || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Progression de l'Apprentissage</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Progression des Fiches</h3>
          <Pie data={fichesReadData} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Scores aux Quiz</h3>
          <Bar data={quizScoresData} />
        </div>
      </div>
    </div>
  );
};

export default LearningProgress;
