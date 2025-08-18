
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemoFiche } from '../types';
import FlashcardDeck from '../components/FlashcardDeck';
import QuizSection from '../components/QuizSection';
import GlossaryList from '../components/GlossaryList';
import ContentSection from '../components/ContentSection';
import { BookOpenIcon, VideoCameraIcon, QuestionMarkCircleIcon, SparklesIcon, DocumentTextIcon, ChevronRightIcon, TrashIcon, GameIcon } from '../components/icons';
import { FiMic, FiMessageSquare } from 'react-icons/fi';
import { useData } from '../App';
import { useAuth } from '../App';
import AICoachModal from '../components/AICoachModal';

interface DetailPageProps {
  memoFiche: MemoFiche;
}

type Tab = 'memo' | 'summary' | 'flashcards' | 'quiz' | 'glossary' | 'resources' | 'kahoot';

const DetailPage: React.FC<DetailPageProps> = ({ memoFiche }) => {
  const [activeTab, setActiveTab] = useState<Tab>('memo');
  const [scroll, setScroll] = useState(0);
  const { deleteMemoFiche, fetchLearnerData } = useData();
  const { canEditMemoFiches, canDeleteMemoFiches } = useAuth();
  const navigate = useNavigate();
  const [isCoachModalOpen, setCoachModalOpen] = useState(false);

  const { id, title, shortDescription, imageUrl, theme, systeme_organe, createdAt, imagePosition } = memoFiche;

  const imagePositionClass = imagePosition ? `object-${imagePosition}` : 'object-center';

  useEffect(() => {
    const recordFicheRead = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/me/read-fiches`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ ficheId: memoFiche.id }),
        });

        if (response.ok) {
          fetchLearnerData(); // Re-fetch learner data
        }
      } catch (error) {
        console.error('Failed to record fiche read:', error);
      }
    };

    recordFicheRead();
  }, [memoFiche.id, fetchLearnerData]);

  useEffect(() => {
    const handleScroll = () => {
        const scrollTop = window.scrollY;
        const contentNode = document.documentElement;
        const adjustedScrollTop = Math.max(0, scrollTop - 64);
        const adjustedHeight = contentNode.scrollHeight - window.innerHeight - 64;
        
        if (adjustedHeight > 0) {
            const scrollPercent = (adjustedScrollTop / adjustedHeight) * 100;
            setScroll(Math.min(100, Math.max(0, scrollPercent)));
        } else {
            setScroll(scrollTop > 64 ? 100 : 0);
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, [memoFiche]);
  
  const handleDelete = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette mémofiche ? Cette action est irréversible.")) {
      deleteMemoFiche(memoFiche.id);
      navigate('/fiches');
    }
  };
  
  const multimediaResources = memoFiche.externalResources?.filter(r => r.type === 'video' || r.type === 'podcast') || [];

  const getYouTubeEmbedUrl = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*$/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
          return `https://www.youtube.com/embed/${match[2]}`;
      }
      return null;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'memo':
        return <ContentSection sections={memoFiche.memoContent} glossaryTerms={memoFiche.glossaryTerms} />;
      case 'summary':
        return (
          <div className="prose max-w-none text-gray-700">
             <h3 className="text-xl font-bold text-gray-800 mb-2">Résumé Flash</h3>
            <p>{memoFiche.flashSummary}</p>
            {memoFiche.summaryVideoUrl && getYouTubeEmbedUrl(memoFiche.summaryVideoUrl) && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Vidéo Explicative</h4>
                <div className="relative" style={{ paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                  <iframe
                    src={getYouTubeEmbedUrl(memoFiche.summaryVideoUrl) || ''}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Vidéo Explicative"
                    className="absolute top-0 left-0 w-full h-full"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        );
      case 'flashcards':
        return <FlashcardDeck flashcards={memoFiche.flashcards} />;
      case 'quiz':
        return <QuizSection quiz={memoFiche.quiz} memoFiche={memoFiche} />;
      case 'glossary':
        return <GlossaryList terms={memoFiche.glossaryTerms} />;
      case 'kahoot':
         if (!memoFiche.kahootUrl) return <p className="text-gray-500">Aucun quiz Kahoot disponible pour cette fiche.</p>;
        return (
             <div>
                <style>{`
                    .kahoot-embed {
                        position: relative;
                        padding-bottom: 56.25%;
                        height: 0;
                        overflow: hidden;
                        width: 100%;
                        border-radius: 0.5rem;
                        border: 1px solid #e5e7eb;
                    }
                    .kahoot-embed iframe {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                    }
                `}</style>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quiz Kahoot!</h3>
                <div className="kahoot-embed">
                    <iframe
                        src={memoFiche.kahootUrl}
                        title={`Kahoot Quiz: ${memoFiche.title}`}
                        allow="fullscreen"
                    ></iframe>
                </div>
            </div>
        );
      case 'resources':
        return (
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Ressources Multimédia</h3>
                {multimediaResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Grid for side-by-side layout */}
                        {multimediaResources.map((resource, index) => (
                            <div key={index} className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">{resource.title}</h4>
                                {resource.type === 'video' && getYouTubeEmbedUrl(resource.url) ? (
                                    <div className="relative" style={{ paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                                        <iframe
                                            src={getYouTubeEmbedUrl(resource.url) || ''}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            title={resource.title}
                                            className="absolute top-0 left-0 w-full h-full"
                                        ></iframe>
                                    </div>
                                ) : resource.type === 'podcast' ? (
                                    <div className="flex items-center space-x-3"> {/* Flex for icon and audio */}
                                        <FiMic className="w-8 h-8 text-gray-600" /> {/* Microphone icon */}
                                        <audio controls src={resource.url} className="flex-grow"> {/* flex-grow to take remaining space */}
                                            Votre navigateur ne supporte pas l'élément audio.
                                        </audio>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Type de ressource non pris en charge pour la prévisualisation.</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">Aucune vidéo ou podcast disponible pour cette fiche.</p>
                )}
            </div>
        );
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tab: Tab; label: string; icon: React.ReactNode }> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tab
          ? 'bg-green-600 text-white shadow'
          : 'text-gray-600 hover:bg-green-100 hover:text-green-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <>
      <div className="fixed top-16 left-0 w-full h-1 bg-gray-200 z-40">
        <div className="h-1 bg-green-600 transition-all duration-75" style={{ width: `${scroll}%` }}></div>
      </div>
      <div className="container mx-auto p-4 md:p-8 mt-1">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="relative">
              <img src={memoFiche.imageUrl} alt={memoFiche.title} className={`w-full h-48 md:h-64 object-cover ${imagePositionClass}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
               {canEditMemoFiches && (
                <div className="absolute top-4 right-4 z-10 flex space-x-2">
                    <button
                        onClick={() => navigate(`/edit-memofiche/${memoFiche.id}`)}
                        className="p-2 bg-white/80 rounded-full text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                        aria-label="Modifier la fiche"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </button>
                    {canDeleteMemoFiches && (
                        <button
                            onClick={handleDelete}
                            className="p-2 bg-white/80 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"
                            aria-label="Supprimer la fiche"
                        >
                            <TrashIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
               )}
              <div className="absolute bottom-0 left-0 p-6 w-full">
                  <div className="flex flex-wrap gap-2 text-xs mb-2">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full font-semibold">{memoFiche.theme.Nom}</span>
                      <span className="bg-slate-600 text-white px-3 py-1 rounded-full font-semibold">{memoFiche.systeme_organe.Nom}</span>
                      <span className="bg-slate-500 text-white px-3 py-1 rounded-full font-semibold">{memoFiche.level}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">{memoFiche.title}</h1>
                  {memoFiche.createdAt && (
                     <p className="text-white/80 font-medium text-sm">
                        Créé le {new Date(memoFiche.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
              </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
               <p className="text-lg text-gray-600">{memoFiche.shortDescription}</p>
            </div>

            <div className="border-b border-gray-200 mb-6">
              <nav className="flex flex-wrap gap-2 md:gap-4 -mb-px">
                <TabButton tab="memo" label="Mémo" icon={<DocumentTextIcon className="w-5 h-5"/>} />
                <TabButton tab="summary" label="Résumé" icon={<SparklesIcon className="w-5 h-5"/>} />
                <TabButton tab="flashcards" label="FlashCards" icon={<SparklesIcon className="w-5 h-5"/>} />
                <TabButton tab="quiz" label="Quiz" icon={<QuestionMarkCircleIcon className="w-5 h-5"/>} />
                <TabButton tab="glossary" label="Glossaire" icon={<BookOpenIcon className="w-5 h-5"/>} />
                {memoFiche.kahootUrl && <TabButton tab="kahoot" label="Kahoot" icon={<GameIcon className="w-5 h-5"/>} />}
                {multimediaResources.length > 0 && <TabButton tab="resources" label="Ressources" icon={<VideoCameraIcon className="w-5 h-5"/>} />}
              </nav>
            </div>
            
            <div className="min-h-[200px]">
              {renderContent()}
            </div>

             <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <button onClick={() => setCoachModalOpen(true)} className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full">
                    <FiMessageSquare />
                    Demander au Coach IA
                </button>
            </div>
          </div>
        </div>
      </div>
      <AICoachModal isOpen={isCoachModalOpen} onClose={() => setCoachModalOpen(false)} ficheTitle={title} />
    </>
  );
};

export default DetailPage;
