
import React, { useState } from 'react';
import { Flashcard } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon, CheckCircleIcon } from './icons';

interface FlashcardDeckProps {
  flashcards: Flashcard[];
}

const FlashcardView: React.FC<{ flashcard: Flashcard }> = ({ flashcard }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    React.useEffect(() => {
        setIsFlipped(false);
    }, [flashcard]);

    return (
        <div className="w-full h-64 perspective-1000" onClick={() => setIsFlipped(!isFlipped)} role="button" aria-pressed={isFlipped} tabIndex={0}>
            <div
                className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden bg-white border-2 border-green-500 rounded-lg shadow-lg flex items-center justify-center p-6 cursor-pointer">
                    <p className="text-xl font-semibold text-center text-gray-800">{flashcard.question}</p>
                </div>
                {/* Back */}
                <div className="absolute w-full h-full backface-hidden bg-green-600 rounded-lg shadow-lg flex items-center justify-center p-6 transform rotate-y-180 cursor-pointer">
                    <p className="text-lg text-center text-white">{flashcard.answer}</p>
                </div>
            </div>
        </div>
    );
};


const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalCards = flashcards.length;
  if (!flashcards || totalCards === 0) {
      return <p>Pas de fiches flash disponibles.</p>;
  }

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? totalCards : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev === totalCards ? 0 : prev + 1));
  };
  
  const resetDeck = () => {
    setCurrentIndex(0);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">FlashCards Interactives</h3>
      
      {currentIndex < totalCards ? (
        <FlashcardView flashcard={flashcards[currentIndex]} />
      ) : (
        <div className="w-full h-64 bg-white border-2 border-green-500 rounded-lg shadow-lg flex flex-col items-center justify-center p-6 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mb-3" />
            <h4 className="text-2xl font-bold text-gray-800">Bravo, mission accomplie !</h4>
            <p className="mt-2 text-gray-600">Vous avez terminé toutes les fiches. La répétition est la clé de la mémorisation !</p>
            <button onClick={resetDeck} className="mt-4 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors">
                Recommencer
            </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <button onClick={goToPrevious} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition" aria-label="Carte précédente">
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <p className="text-sm font-medium text-gray-600">
          {currentIndex < totalCards ? `Carte ${currentIndex + 1} sur ${totalCards}` : 'Terminé !'}
        </p>
        <button onClick={goToNext} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition" aria-label={currentIndex < totalCards -1 ? 'Carte suivante' : 'Voir le résultat'}>
          <ChevronRightIcon className="w-6 h-6 text-gray-700" />
        </button>
      </div>
       <style>{`
            .perspective-1000 { perspective: 1000px; }
            .transform-style-preserve-3d { transform-style: preserve-3d; }
            .rotate-y-180 { transform: rotateY(180deg); }
            .backface-hidden { backface-visibility: hidden; }
        `}</style>
    </div>
  );
};

export default FlashcardDeck;
