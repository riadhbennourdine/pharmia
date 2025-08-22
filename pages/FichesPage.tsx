
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData, useAuth } from '../App';
import MemoCard from '../components/MemoCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ResetIcon } from '../components/icons';

const FichesPage: React.FC = () => {
  const { data, loading, error, deleteMemoFiche } = useData();
  const { canEditMemoFiches, canDeleteMemoFiches, isLoggedIn } = useAuth();
  const [themeFilter, setThemeFilter] = useState<string>('');
  const [systemFilter, setSystemFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette mémofiche ?")) {
      await deleteMemoFiche(id);
    }
  };

  const filteredMemofiches = useMemo(() => {
    if (!data) return [];
    return data.memofiches
      .filter(mf => {
        const themeMatch = themeFilter ? mf.theme.Nom === themeFilter : true;
        const systemMatch = systemFilter ? mf.systeme_organe.Nom === systemFilter : true;
        const searchMatch = searchQuery ? mf.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
        return themeMatch && systemMatch && searchMatch;
      })
      .slice(0, 9);
  }, [data, themeFilter, systemFilter, searchQuery]);

  const resetFilters = () => {
    setThemeFilter('');
    setSystemFilter('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <LoadingSpinner />
        <p className="text-gray-600 mt-4 text-lg">Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur de chargement</h2>
        <p className="text-gray-600">{error}</p>
        <p className="mt-4">Veuillez rafraîchir la page. Si le problème persiste, contactez le support.</p>
      </div>
    );
  }

  if (!data || data.memofiches.length === 0) {
    return (
        <div className="container mx-auto p-4 md:p-8 text-center">
            <div className="py-16 px-6 bg-white rounded-xl shadow-md border border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-700">Aucune mémofiche dans votre bibliothèque</h3>
                <p className="text-gray-500 mt-4 max-w-xl mx-auto">
                    Il semble que vous n'ayez pas encore créé de mémofiche. <br/>
                    Utilisez le Générateur pour commencer à construire votre base de connaissances.
                </p>
                {canEditMemoFiches && (
                    <Link
                        to="/generateur"
                        className="mt-6 inline-block bg-green-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-green-700 transition-transform duration-300 hover:scale-105"
                    >
                        Créer une Mémofiche
                    </Link>
                )}
            </div>
        </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl md:text-6xl font-bold text-left text-gray-800 mb-10">
        <span className="animated-gradient-text font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-600 to-green-800">Mémofiches récentes</span>
      </h1>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Rechercher une mémofiche..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div className="flex flex-wrap gap-4 mb-8 justify-start"> {/* Changed justify-center to justify-start */}
        <div className="flex-shrink-0"> {/* Theme filter */}
          {/* Removed label */}
          <select
            id="themeFilter"
            value={themeFilter}
            onChange={(e) => setThemeFilter(e.target.value)}
            className="p-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm" /* Reduced padding, added text-sm */
          >
            <option value="">Tous les thèmes</option>
            {data?.themes.sort((a,b) => a.Nom.localeCompare(b.Nom)).map(theme => (
              <option key={theme.id} value={theme.Nom}>{theme.Nom}</option>
            ))}
          </select>
        </div>

        <div className="flex-shrink-0"> {/* System/Organ filter */}
          {/* Removed label */}
          <select
            id="systemFilter"
            value={systemFilter}
            onChange={(e) => setSystemFilter(e.target.value)}
            className="p-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm" /* Reduced padding, added text-sm */
          >
            <option value="">Tous les systèmes</option>
            {data?.systemesOrganes.sort((a,b) => a.Nom.localeCompare(b.Nom)).map(sys => (
              <option key={sys.id} value={sys.Nom}>{sys.Nom}</option>
            ))}
          </select>
        </div>
        
        {/* Reset Button */}
        <button
          onClick={resetFilters}
          className="p-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center"
        >
          <ResetIcon className="w-5 h-5"/>
        </button>
      </div>

      {filteredMemofiches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMemofiches.map(memofiche => (
            isLoggedIn ? (
              <Link key={memofiche.id} to={`/fiches/${memofiche.id}`} className="block">
                <MemoCard memofiche={memofiche} onDelete={canDeleteMemoFiches ? handleDelete : undefined} />
              </Link>
            ) : (
              <div
                key={memofiche.id}
                className="block"
              >
                <MemoCard memofiche={memofiche} onDelete={undefined} />
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-700">Aucune mémofiche trouvée</h3>
          <p className="text-gray-500 mt-2">Essayez d'ajuster ou de réinitialiser vos filtres.</p>
        </div>
      )}
    </div>
  );
};

export default FichesPage;
