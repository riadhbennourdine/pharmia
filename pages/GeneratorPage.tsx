
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../App';
import { generateSingleMemoFiche, generateCommunicationMemoFiche } from '../services/geminiService';
import { MemoFiche, Theme, SystemeOrgane } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import MemoCard from '../components/MemoCard';
import { SparklesIcon, CheckCircleIcon } from '../components/icons';

interface CategoryCardProps {
    item: { id: string; Nom: string; description?: string };
    isSelected: boolean;
    onSelect: (id: string) => void;
    disabled: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ item, isSelected, onSelect, disabled }) => (
    <button
        type="button"
        onClick={() => onSelect(item.id)}
        disabled={disabled}
        className={`relative text-left p-4 h-full border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 ${
            isSelected
                ? 'bg-green-50 border-green-500 shadow-md'
                : 'bg-white border-gray-200 hover:border-green-400 hover:shadow-sm'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
        {isSelected && <CheckCircleIcon className="w-6 h-6 text-green-500 absolute top-2 right-2" />}
        <h4 className="font-bold text-gray-800 text-base">{item.Nom}</h4>
        {item.description && (
            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
        )}
    </button>
);


const GeneratorPage: React.FC = () => {
    const { data, addMemoFiche, getMemoFicheById, updateMemoFiche } = useData();
    const navigate = useNavigate();
    const { id: memoFicheId } = useParams<{ id: string }>(); // Get ID from URL for edit mode

    const [prompt, setPrompt] = useState('');
    const [generatedFiche, setGeneratedFiche] = useState<MemoFiche | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const [themeSelection, setThemeSelection] = useState('');
    const [systemSelection, setSystemSelection] = useState('');
    const [newThemeName, setNewThemeName] = useState('');
    const [newSystemName, setNewSystemName] = useState('');

    const [imageUrl, setImageUrl] = useState('');
    const [imagePosition, setImagePosition] = useState<"top" | "middle" | "bottom">('middle'); // New state, default to 'middle'
    const [kahootUrl, setKahootUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [summaryVideoUrl, setSummaryVideoUrl] = useState('');
    const [podcastUrl, setPodcastUrl] = useState('');
    const [title, setTitle] = useState('');
    const [memoContent, setMemoContent] = useState<MemoFiche['memoContent']>([]);
    const [flashcards, setFlashcards] = useState<MemoFiche['flashcards']>([]);
    const [quiz, setQuiz] = useState<MemoFiche['quiz']>([]);

    const isCommunicationTheme = data?.themes.find(t => t.id === themeSelection)?.Nom === 'Communication';

    // Effect to load memo fiche data if in edit mode
    useEffect(() => {
        if (memoFicheId && data) {
            const ficheToEdit = getMemoFicheById(memoFicheId);
            if (ficheToEdit) {
                setTitle(ficheToEdit.title);
                setPrompt(ficheToEdit.flashSummary); // Using flashSummary as the prompt for editing
                setThemeSelection(ficheToEdit.theme.id);
                setSystemSelection(ficheToEdit.systeme_organe.id);
                setImageUrl(ficheToEdit.imageUrl || '');
                setImagePosition(ficheToEdit.imagePosition || 'middle'); // Load imagePosition
                setKahootUrl(ficheToEdit.kahootUrl || '');
                setSummaryVideoUrl(ficheToEdit.summaryYoutubeUrl || '');
                setMemoContent(ficheToEdit.memoContent || []); // Load memoContent for editing
                setFlashcards(ficheToEdit.flashcards || []);
                setQuiz(ficheToEdit.quiz || []);
                // Assuming videoUrl and podcastUrl are part of externalResources
                const videoRes = ficheToEdit.externalResources?.find(r => r.type === 'video');
                setVideoUrl(videoRes ? videoRes.url : '');
                const podcastRes = ficheToEdit.externalResources?.find(r => r.type === 'podcast');
                setPodcastUrl(podcastRes ? podcastRes.url : '');
            } else {
                setError("Mémofiche non trouvée pour l'édition.");
            }
        } else if (!memoFicheId) {
            // Clear memoContent when creating a new fiche
            setMemoContent([]);
        }
    }, [memoFicheId, data, getMemoFicheById]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const isThemeReady = themeSelection && (themeSelection !== 'CREATE_NEW' || (themeSelection === 'CREATE_NEW' && newThemeName.trim()));
        const isSystemReady = isCommunicationTheme || (systemSelection && (systemSelection !== 'CREATE_NEW' || (systemSelection === 'CREATE_NEW' && newSystemName.trim())));

        if (!prompt || loading || !isThemeReady || !isSystemReady) return;

        if (!data) {
            setError("Les données de base ne sont pas encore chargées. Veuillez patienter ou rafraîchir la page.");
            return;
        }

        setLoading(true);
        setError(null);
        setGeneratedFiche(null);
        setIsSuccess(false);

        try {
            let themeForApi: Theme;
            if (themeSelection === 'CREATE_NEW') {
                themeForApi = { id: crypto.randomUUID(), Nom: newThemeName.trim() };
            } else {
                themeForApi = data.themes.find(t => t.id === themeSelection)!;
            }

            const generationOptions = {
                imageUrl: imageUrl.trim() || undefined,
                kahootUrl: kahootUrl.trim() || undefined,
                videoUrl: videoUrl.trim() || undefined, // This is for the long video in resources
                podcastUrl: podcastUrl.trim() || undefined,
                summaryVideoUrl: summaryVideoUrl.trim() || undefined, // This is for the short video in summary
            };

            let savedFiche: MemoFiche;
            if (memoFicheId) {
                // Update existing memo fiche
                const existingFiche = getMemoFicheById(memoFicheId);
                if (!existingFiche) {
                    throw new Error("Mémofiche à mettre à jour non trouvée.");
                }
                const updatedFiche: MemoFiche = {
                    ...existingFiche,
                    title: title,
                    flashSummary: prompt, // Assuming prompt is the main editable content
                    theme: themeForApi,
                    systeme_organe: isCommunicationTheme ? { id: 'communication', Nom: 'Communication' } : data.systemesOrganes.find(s => s.id === systemSelection)!,
                    imageUrl: imageUrl.trim() || '',
                    imagePosition: imagePosition, // Add imagePosition here
                    kahootUrl: kahootUrl.trim() || '',
                    summaryYoutubeUrl: summaryVideoUrl.trim() || undefined,
                    externalResources: [
                        ...(videoUrl.trim() ? [{ type: 'video', title: 'Vidéo', url: videoUrl.trim() }] : []),
                        ...(podcastUrl.trim() ? [{ type: 'podcast', title: 'Podcast', url: podcastUrl.trim() }] : []),
                    ],
                    memoContent: memoContent, // Include memoContent in the update
                    flashcards: flashcards,
                    quiz: quiz,
                };
                savedFiche = await updateMemoFiche(updatedFiche);
            } else {
                // Generate and add new memo fiche
                let ficheFromGemini: MemoFiche;
                if (isCommunicationTheme) {
                    ficheFromGemini = await generateCommunicationMemoFiche(prompt, themeForApi, generationOptions);
                } else {
                    let systemForApi: SystemeOrgane;
                    if (systemSelection === 'CREATE_NEW') {
                        systemForApi = { id: crypto.randomUUID(), Nom: newSystemName.trim() };
                    } else {
                        systemForApi = data.systemesOrganes.find(s => s.id === systemSelection)!;
                    }
                    ficheFromGemini = await generateSingleMemoFiche(prompt, themeForApi, systemForApi, generationOptions);
                }
                savedFiche = await addMemoFiche(ficheFromGemini);
            }

            setGeneratedFiche(savedFiche);
            setIsSuccess(true);
            
            if (!memoFicheId) {
                setPrompt('');
                setThemeSelection('');
                setSystemSelection('');
                setNewThemeName('');
                setNewSystemName('');
                setImageUrl('');
                setKahootUrl('');
                setVideoUrl('');
                setPodcastUrl('');
                setSummaryYoutubeUrl('');
                setMemoContent([]);
            }

        } catch (err: any) {
            setError(err.message || "Une erreur inconnue est survenue lors de la génération/mise à jour.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isReadyToSubmit = prompt.trim() &&
        (themeSelection && (themeSelection !== 'CREATE_NEW' || (themeSelection === 'CREATE_NEW' && newThemeName.trim()))) &&
        (isCommunicationTheme || (systemSelection && (systemSelection !== 'CREATE_NEW' || (systemSelection === 'CREATE_NEW' && newSystemName.trim()))));

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 border border-gray-200 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <SparklesIcon className="w-8 h-8 text-green-500" />
                        <h1 className="text-3xl font-bold text-gray-800">{memoFicheId ? 'Modifier la Mémofiche' : 'Générateur de Mémofiches'}</h1>
                    </div>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {memoFicheId ? 'Mettez à jour les informations de votre mémofiche.' : 'Suivez les étapes pour transformer un texte brut en une mémofiche pédagogique complète.'}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
                    <form onSubmit={handleGenerate} className="space-y-10">
                        {/* THEMES */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-1">Étape 1 : Choisissez un Thème</h2>
                            <p className="text-gray-500 mb-4">Sélectionnez la catégorie thématique principale de votre mémofiche.</p>
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {data?.themes.sort((a,b) => a.Nom.localeCompare(b.Nom)).map(theme => (
                                    <CategoryCard key={theme.id} item={theme} isSelected={themeSelection === theme.id} onSelect={setThemeSelection} disabled={loading} />
                                ))}
                                <button type="button" onClick={() => setThemeSelection('CREATE_NEW')} disabled={loading} className={`relative text-left p-4 h-full border-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center text-center focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 ${themeSelection === 'CREATE_NEW' ? 'bg-green-50 border-green-500 shadow-md' : 'bg-slate-50 border-gray-200 hover:border-green-400 hover:shadow-sm'}`}>
                                    {themeSelection === 'CREATE_NEW' && <CheckCircleIcon className="w-6 h-6 text-green-500 absolute top-2 right-2" />}
                                    <span className="font-bold text-gray-800 text-base">+ Créer un thème</span>
                                </button>
                            </div>
                            {themeSelection === 'CREATE_NEW' && (
                                <div className="mt-4">
                                    <input type="text" value={newThemeName} onChange={e => setNewThemeName(e.target.value)} placeholder="Nom du nouveau thème" className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" required disabled={loading} />
                                </div>
                            )}
                        </div>

                        {/* SYSTEMS */}
                        {!isCommunicationTheme && (
                             <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-1">Étape 2 : Choisissez un Organe / Système</h2>
                            <p className="text-gray-500 mb-4">Associez la mémofiche au système corporel pertinent.</p>
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {data?.systemesOrganes.sort((a, b) => a.Nom.localeCompare(b.Nom)).map(sys => (
                                    <CategoryCard key={sys.id} item={sys} isSelected={systemSelection === sys.id} onSelect={setSystemSelection} disabled={loading} />
                                ))}
                                 <button type="button" onClick={() => setSystemSelection('CREATE_NEW')} disabled={loading} className={`relative text-left p-4 h-full border-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center text-center focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 ${systemSelection === 'CREATE_NEW' ? 'bg-green-50 border-green-500 shadow-md' : 'bg-slate-50 border-gray-200 hover:border-green-400 hover:shadow-sm'}`}>
                                    {systemSelection === 'CREATE_NEW' && <CheckCircleIcon className="w-6 h-6 text-green-500 absolute top-2 right-2" />}
                                    <span className="font-bold text-gray-800 text-base">+ Créer un système</span>
                                </button>
                            </div>
                            {systemSelection === 'CREATE_NEW' && (
                                 <div className="mt-4">
                                    <input type="text" value={newSystemName} onChange={e => setNewSystemName(e.target.value)} placeholder="Nom du nouveau système" className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" required disabled={loading} />
                                 </div>
                            )}
                        </div>
                        )}
                        
                        {memoFicheId && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-1">Titre</h2>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Titre de la mémofiche"
                                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        )}

                        {/* PROMPT */}
                        <div>
                           <h2 className="text-xl font-bold text-gray-800 mb-1">Étape 3 : Texte brut à analyser</h2>
                           <p className="text-gray-500 mb-4">Collez ici le cas clinique, la description de la pathologie ou la situation officinale.</p>
                            <textarea
                                id="topic"
                                rows={10}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Collez votre texte ici..."
                                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* MEMO CONTENT SECTIONS (EDIT MODE ONLY) */}
                        {memoFicheId && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-1">Étape 3.5 : Contenu de la Mémofiche</h2>
                                <p className="text-gray-500 mb-4">Modifiez les sections de la mémofiche. Vous pouvez ajouter ou supprimer des sections.</p>
                                <div className="space-y-4">
                                    {memoContent.map((section, index) => (
                                        <div key={section.id || `new-section-${index}`} className="p-4 border border-gray-200 rounded-md bg-gray-50">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-semibold text-gray-700">Section {index + 1}</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setMemoContent(prev => prev.filter((_, i) => i !== index));
                                                    }}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={section.title}
                                                onChange={(e) => {
                                                    const newContent = [...memoContent];
                                                    newContent[index].title = e.target.value;
                                                    setMemoContent(newContent);
                                                }}
                                                placeholder="Titre de la section"
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 mb-2"
                                                disabled={loading}
                                            />
                                            <textarea
                                                rows={6}
                                                value={section.content}
                                                onChange={(e) => {
                                                    const newContent = [...memoContent];
                                                    newContent[index].content = e.target.value;
                                                    setMemoContent(newContent);
                                                }}
                                                placeholder="Contenu de la section (Markdown)"
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                                disabled={loading}
                                            />
                                            {section.children && section.children.length > 0 && (
                                                <div className="mt-4 pl-4 border-l-2 border-gray-200">
                                                    <h4 className="font-semibold text-gray-600 mb-2">Sous-sections</h4>
                                                    {section.children.map((child, childIndex) => (
                                                        <div key={child.id || `new-child-section-${index}-${childIndex}`} className="p-3 border border-gray-200 rounded-md bg-gray-100 mb-2">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <h5 className="font-semibold text-gray-700">Sous-section {childIndex + 1}</h5>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newContent = [...memoContent];
                                                                        newContent[index].children = newContent[index].children?.filter((_, i) => i !== childIndex);
                                                                        setMemoContent(newContent);
                                                                    }}
                                                                    className="text-red-500 hover:text-red-700 transition-colors text-sm"
                                                                >
                                                                    Supprimer
                                                                </button>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={child.title}
                                                                onChange={(e) => {
                                                                    const newContent = [...memoContent];
                                                                    if (newContent[index].children) {
                                                                        newContent[index].children![childIndex].title = e.target.value;
                                                                    }
                                                                    setMemoContent(newContent);
                                                                }}
                                                                placeholder="Titre de la sous-section"
                                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 mb-2"
                                                                disabled={loading}
                                                            />
                                                            <textarea
                                                                rows={4}
                                                                value={child.content}
                                                                onChange={(e) => {
                                                                    const newContent = [...memoContent];
                                                                    if (newContent[index].children) {
                                                                        newContent[index].children![childIndex].content = e.target.value;
                                                                    }
                                                                    setMemoContent(newContent);
                                                                }}
                                                                placeholder="Contenu de la sous-section (Markdown)"
                                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                                                disabled={loading}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newContent = [...memoContent];
                                                                    if (newContent[index].children) {
                                                                        newContent[index].children!.push({
                                                                            id: crypto.randomUUID(),
                                                                            title: '',
                                                                            content: '',
                                                                        });
                                                                    }
                                                                    setMemoContent(newContent);
                                                                }}
                                                                className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                                                                disabled={loading}
                                                            >
                                                                Ajouter une sous-section
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newContent = [...memoContent];
                                                            if (!newContent[index].children) {
                                                                newContent[index].children = [];
                                                            }
                                                            newContent[index].children!.push({
                                                                id: crypto.randomUUID(),
                                                                title: '',
                                                                content: '',
                                                            });
                                                            setMemoContent(newContent);
                                                        }}
                                                        className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                                                        disabled={loading}
                                                    >
                                                        Ajouter une sous-section
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMemoContent(prev => [...prev, { id: crypto.randomUUID(), title: '', content: '' }]);
                                        }}
                                        className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400"
                                        disabled={loading}
                                    >
                                        Ajouter une nouvelle section
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* FLASHCARDS (EDIT MODE ONLY) */}
                        {memoFicheId && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-1">Flashcards</h2>
                                <div className="space-y-4">
                                    {flashcards.map((flashcard, index) => (
                                        <div key={index} className="p-4 border border-gray-200 rounded-md bg-gray-50">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-semibold text-gray-700">Flashcard {index + 1}</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFlashcards(prev => prev.filter((_, i) => i !== index));
                                                    }}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                            <textarea
                                                rows={2}
                                                value={flashcard.question}
                                                onChange={(e) => {
                                                    const newFlashcards = [...flashcards];
                                                    newFlashcards[index].question = e.target.value;
                                                    setFlashcards(newFlashcards);
                                                }}
                                                placeholder="Question"
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 mb-2"
                                                disabled={loading}
                                            />
                                            <textarea
                                                rows={3}
                                                value={flashcard.answer}
                                                onChange={(e) => {
                                                    const newFlashcards = [...flashcards];
                                                    newFlashcards[index].answer = e.target.value;
                                                    setFlashcards(newFlashcards);
                                                }}
                                                placeholder="Réponse"
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                                disabled={loading}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFlashcards(prev => [...prev, { question: '', answer: '' }]);
                                        }}
                                        className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400"
                                        disabled={loading}
                                    >
                                        Ajouter une Flashcard
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* QUIZ (EDIT MODE ONLY) */}
                        {memoFicheId && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-1">Quiz</h2>
                                <div className="space-y-4">
                                    {quiz.map((quizItem, index) => (
                                        <div key={index} className="p-4 border border-gray-200 rounded-md bg-gray-50">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-semibold text-gray-700">Question {index + 1}</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setQuiz(prev => prev.filter((_, i) => i !== index));
                                                    }}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                            <textarea
                                                rows={2}
                                                value={quizItem.question}
                                                onChange={(e) => {
                                                    const newQuiz = [...quiz];
                                                    newQuiz[index].question = e.target.value;
                                                    setQuiz(newQuiz);
                                                }}
                                                placeholder="Question du quiz"
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 mb-2"
                                                disabled={loading}
                                            />
                                            {quizItem.options.map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex items-center mb-2">
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => {
                                                            const newQuiz = [...quiz];
                                                            newQuiz[index].options[optionIndex] = e.target.value;
                                                            setQuiz(newQuiz);
                                                        }}
                                                        placeholder={`Option ${optionIndex + 1}`}
                                                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                                        disabled={loading}
                                                    />
                                                </div>
                                            ))}
                                            <input
                                                type="text"
                                                value={quizItem.correctAnswer}
                                                onChange={(e) => {
                                                    const newQuiz = [...quiz];
                                                    newQuiz[index].correctAnswer = e.target.value;
                                                    setQuiz(newQuiz);
                                                }}
                                                placeholder="Réponse correcte"
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 mb-2"
                                                disabled={loading}
                                            />
                                            <textarea
                                                rows={3}
                                                value={quizItem.explanation}
                                                onChange={(e) => {
                                                    const newQuiz = [...quiz];
                                                    newQuiz[index].explanation = e.target.value;
                                                    setQuiz(newQuiz);
                                                }}
                                                placeholder="Explication"
                                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                                disabled={loading}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQuiz(prev => [...prev, { question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', explanation: '' }]);
                                        }}
                                        className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400"
                                        disabled={loading}
                                    >
                                        Ajouter une Question de Quiz
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* OPTIONAL RESOURCES */}
                        <div>
                           <h2 className="text-xl font-bold text-gray-800 mb-1">Étape 4 : Ressources (Optionnel)</h2>
                           <p className="text-gray-500 mb-4">Fournissez des liens directs pour enrichir la mémofiche. Si laissés vides, l'IA en suggérera.</p>
                           <div className="space-y-4">
                                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="URL de l'image de couverture" className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" disabled={loading} />
                                <div className="flex items-center space-x-4">
                                    <label className="block text-sm font-medium text-gray-700">Position de l'image :</label>
                                    <div className="mt-1 flex space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className="form-radio h-4 w-4 text-green-600"
                                                name="imagePosition"
                                                value="top"
                                                checked={imagePosition === 'top'}
                                                onChange={() => setImagePosition('top')}
                                                disabled={loading}
                                            />
                                            <span className="ml-2 text-gray-700">Haut</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className="form-radio h-4 w-4 text-green-600"
                                                name="imagePosition"
                                                value="middle"
                                                checked={imagePosition === 'middle'}
                                                onChange={() => setImagePosition('middle')}
                                                disabled={loading}
                                            />
                                            <span className="ml-2 text-gray-700">Milieu</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className="form-radio h-4 w-4 text-green-600"
                                                name="imagePosition"
                                                value="bottom"
                                                checked={imagePosition === 'bottom'}
                                                onChange={() => setImagePosition('bottom')}
                                                disabled={loading}
                                            />
                                            <span className="ml-2 text-gray-700">Bas</span>
                                        </label>
                                    </div>
                                </div>
                                <input type="url" value={kahootUrl} onChange={e => setKahootUrl(e.target.value)} placeholder="URL du quiz Kahoot!" className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" disabled={loading} />
                                <div className="mt-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">Vidéo YouTube (Résumé) (Optionnel)</h3>
                                    <p className="text-gray-500 mb-2">Lien YouTube pour la vidéo courte du résumé de la mémofiche.</p>
                                    <input type="url" value={summaryVideoUrl} onChange={e => setSummaryVideoUrl(e.target.value)} placeholder="URL YouTube pour le résumé" className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" disabled={loading} />
                                </div>
                                <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="URL de la vidéo YouTube" className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" disabled={loading} />
                                <input type="url" value={podcastUrl} onChange={e => setPodcastUrl(e.target.value)} placeholder="URL du podcast" className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" disabled={loading} />
                           </div>
                        </div>
                        
                        {/* SUBMIT */}
                        <div>
                            <button
                                type="submit"
                                disabled={!isReadyToSubmit || loading}
                                className="w-full flex items-center justify-center gap-3 bg-green-600 text-white font-bold px-6 py-4 rounded-lg shadow-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
                            >
                                <SparklesIcon className="w-6 h-6"/>
                                {loading ? (memoFicheId ? 'Mise à jour en cours...' : 'Génération en cours...') : (memoFicheId ? 'Mettre à jour la Mémofiche' : 'Générer la Mémofiche')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* RESULTS */}
                {loading && (
                    <div className="mt-8 flex flex-col items-center justify-center">
                        <LoadingSpinner />
                        <p className="text-green-700 mt-4 text-lg">L'IA travaille sur votre mémofiche...</p>
                        <p className="text-gray-500">Cela peut prendre jusqu'à 30 secondes.</p>
                    </div>
                )}

                {error && (
                    <div className="mt-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                        <p className="font-bold">Erreur de Génération</p>
                        <p>{error}</p>
                    </div>
                )}

                {isSuccess && generatedFiche && (
                    <div className="mt-8 text-center p-6 bg-green-50 border border-green-200 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-green-800 mb-2">Succès !</h2>
                        <p className="text-gray-700 mb-4">La mémofiche "{generatedFiche.title}" a été ajoutée à votre bibliothèque.</p>
                        <div className="max-w-sm mx-auto mb-6">
                           <MemoCard memofiche={generatedFiche} />
                        </div>
                        <div className="flex justify-center gap-4">
                             <button
                                onClick={() => navigate(`/fiches/${generatedFiche.id}`)}
                                className="bg-white border border-green-600 text-green-600 font-bold px-6 py-2 rounded-lg hover:bg-green-50 transition-transform hover:scale-105"
                            >
                                Voir la fiche
                            </button>
                            <button
                                onClick={() => navigate('/fiches')}
                                className="bg-green-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-green-700 transition-transform hover:scale-105"
                            >
                                Voir toutes les mémofiches
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeneratorPage;
