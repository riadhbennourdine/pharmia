
import React from 'react';
import { MemoFiche } from '../types';
import { TrashIcon, VideoCameraIcon } from './icons';

interface MemoCardProps {
  memofiche: MemoFiche;
  onDelete?: (e: React.MouseEvent, id: string) => void;
}

const MemoCard: React.FC<MemoCardProps> = ({ memofiche, onDelete }) => {
  const { id, title, shortDescription, imageUrl, theme, systeme_organe, createdAt, imagePosition, summaryYoutubeUrl, externalResources } = memofiche;

  const hasVideo = summaryYoutubeUrl || externalResources?.some(r => r.type === 'video');

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const imagePositionClass = imagePosition ? `object-${imagePosition}` : 'object-center';

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 flex flex-col h-full border border-gray-200 hover:border-gray-300 hover:shadow-lg">
      {hasVideo && (
        <div
          className="absolute top-3 left-3 z-10 p-2 bg-white/80 rounded-full text-gray-700"
          aria-label="Contient une vidéo"
        >
          <VideoCameraIcon className="w-5 h-5" />
        </div>
      )}
      {onDelete && (
        <button
          onClick={(e) => onDelete(e, id)}
          className="absolute top-3 right-3 z-10 p-2 bg-white/80 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
          aria-label="Supprimer la fiche"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      )}
      <img src={imageUrl} alt={title} className={`w-full h-48 object-cover ${imagePositionClass}`} />
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{shortDescription}</p>
        {createdAt && (
          <p className="text-gray-500 text-xs mb-2">Créé le: {formatDate(createdAt)}</p>
        )}
        <div className="flex flex-wrap gap-2 text-xs text-gray-700 mt-auto pt-2">
          {theme?.Nom && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
              {theme.Nom}
            </span>
          )}
          {systeme_organe?.Nom && (
            <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full font-medium">
              {systeme_organe.Nom}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoCard;
