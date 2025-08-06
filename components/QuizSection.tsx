
import React, { useState, useMemo } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from './icons';

interface QuizSectionProps {
  quiz: QuizQuestion[];
}

const QuizSection: React.FC<QuizSectionProps> = ({ quiz }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  if (!quiz || quiz.length === 0) {
      return <p>Pas de quiz disponible.</p>;
  }

  const currentQuestion = quiz[currentQuestionIndex];
  const selectedAnswer = userAnswers[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return; // Prevent changing answer after validation
    setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
  };

  const handleValidate = () => {
    if (selectedAnswer) {
      setShowResult(true);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowResult(false);
    } else {
      setIsFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResult(false);
    setIsFinished(false);
  };
  
  const score = useMemo(() => {
      return quiz.reduce((acc, question, index) => {
          return acc + (userAnswers[index] === question.correctAnswer ? 1 : 0);
      }, 0);
  }, [quiz, userAnswers]);

  const getEncouragementMessage = (finalScore: number, total: number): string => {
      const percentage = total > 0 ? (finalScore / total) * 100 : 0;
      if (percentage === 100) return "Excellent ! Score parfait ! Vous maîtrisez ce sujet sur le bout des doigts.";
      if (percentage >= 70) return "Très bon score ! Vous êtes sur la bonne voie, continuez comme ça.";
      if (percentage >= 50) return "Pas mal ! Révisez les explications pour renforcer vos connaissances.";
      return "Continuez vos efforts. Chaque tentative est une occasion d'apprendre !";
  };

  if (isFinished) {
    return (
        <div className="w-full max-w-3xl mx-auto text-center bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <SparklesIcon className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">Quiz Terminé !</h3>
            <p className="text-4xl font-extrabold text-green-600 my-4">{score} / {quiz.length}</p>
            <p className="text-gray-600 mb-6">{getEncouragementMessage(score, quiz.length)}</p>
            <button
              onClick={resetQuiz}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Recommencer le Quiz
            </button>
        </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Testez vos connaissances</h3>
      <p className="text-gray-500 mb-6 text-center font-medium">Question {currentQuestionIndex + 1} sur {quiz.length}</p>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <p className="font-semibold text-gray-800 mb-4">{currentQuestion.question}</p>
        <div className="space-y-3">
          {currentQuestion.options.map((option, optionIndex) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = selectedAnswer === option;
            
            let optionClass = "flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ";
            if (showResult) {
                optionClass += "cursor-not-allowed ";
                if(isCorrect) optionClass += "bg-green-100 border-green-400 text-green-800";
                else if (isSelected) optionClass += "bg-red-100 border-red-400 text-red-800";
                else optionClass += "border-gray-300";
            } else {
               optionClass += isSelected ? "bg-green-100 border-green-500" : "bg-gray-50 hover:bg-gray-100 border-gray-300";
            }

            return (
              <label key={optionIndex} className={optionClass}>
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={option}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(option)}
                  className="hidden"
                  disabled={showResult}
                />
                <span className="flex-grow">{option}</span>
                {showResult && isCorrect && <CheckCircleIcon className="w-5 h-5 text-green-600 ml-auto flex-shrink-0" />}
                {showResult && isSelected && !isCorrect && <XCircleIcon className="w-5 h-5 text-red-600 ml-auto flex-shrink-0" />}
              </label>
            );
          })}
        </div>
        {showResult && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 animate-fade-in">
            <strong>Explication :</strong> {currentQuestion.explanation}
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center">
        {!showResult ? (
             <button
              onClick={handleValidate}
              disabled={!selectedAnswer}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Valider
            </button>
        ) : (
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg shadow-md hover:bg-gray-700 transition"
            >
              {currentQuestionIndex < quiz.length - 1 ? 'Question Suivante' : 'Voir les résultats'}
            </button>
        )}
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default QuizSection;
