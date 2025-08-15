import React from 'react';
import AICoach from './AICoach';

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  ficheTitle: string;
}

const AICoachModal: React.FC<AICoachModalProps> = ({ isOpen, onClose, ficheTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Coach IA</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <AICoach />
      </div>
    </div>
  );
};

export default AICoachModal;
