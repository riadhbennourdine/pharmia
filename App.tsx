
import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import { HashRouter, Routes, Route, useParams, Navigate, Outlet } from 'react-router-dom';
import { PharmIaData, MemoFiche, UserRole, AuthContextType } from './types';
import HomePage from './pages/HomePage';
import FichesPage from './pages/FichesPage';
import DetailPage from './pages/DetailPage';
import GeneratorPage from './pages/GeneratorPage';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';


// --- Authentication Context ---
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const storedRole = localStorage.getItem('userRole');
    // Map stored string to UserRole enum, default to Guest if invalid or not found
    switch (storedRole) {
      case 'Admin': return UserRole.Admin;
      case 'Formateur': return UserRole.Formateur;
      case 'Pharmacien': return UserRole.Pharmacien;
      case 'Préparateur': return UserRole.Preparateur;
      default: return UserRole.Guest;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const login = (role: UserRole, newToken: string) => {
    localStorage.setItem('userRole', role);
    localStorage.setItem('token', newToken);
    setUserRole(role);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    setUserRole(UserRole.Guest);
    setToken(null);
  };

  const authValue = useMemo(() => ({
    userRole,
    token,
    login,
    logout,
    isLoggedIn: userRole !== UserRole.Guest,
    canGenerateMemoFiche: userRole === UserRole.Admin,
    canEditMemoFiches: userRole === UserRole.Admin || userRole === UserRole.Formateur
  }), [userRole, token]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};


// --- Data Context ---
interface DataContextType {
  data: PharmIaData | null;
  loading: boolean;
  error: string | null;
  getMemoFicheById: (id: string) => MemoFiche | undefined;
  addMemoFiche: (fiche: MemoFiche) => Promise<MemoFiche>;
  updateMemoFiche: (fiche: MemoFiche) => Promise<MemoFiche>;
  deleteMemoFiche: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PharmIaData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); // Get token from AuthContext

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/data`, { headers });
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const fetchedData: PharmIaData = await response.json();
        setData(fetchedData);
      } catch (e: any) {
        console.error("Impossible de charger les données depuis le backend", e);
        setError("Impossible de charger les données. Veuillez vérifier votre connexion et rafraîchir la page.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]); // Re-fetch data when token changes

  const addMemoFiche = useCallback(async (newFiche: MemoFiche): Promise<MemoFiche> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/memofiches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newFiche),
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Impossible d'enregistrer la mémofiche: ${errorBody}`);
      }
      const savedFiche: MemoFiche = await response.json();
      
      setData(prevData => {
        if (!prevData) return null;

        const newMemoFiches = [savedFiche, ...prevData.memofiches];
        
        const newThemes = [...prevData.themes];
        if (!newThemes.some(t => t.id === savedFiche.theme.id)) {
            newThemes.push(savedFiche.theme);
        }

        const newSystems = [...prevData.systemesOrganes];
        if (!newSystems.some(s => s.id === savedFiche.systeme_organe.id)) {
            newSystems.push(savedFiche.systeme_organe);
        }

        return {
          themes: newThemes,
          systemesOrganes: newSystems,
          memofiches: newMemoFiches
        };
      });
      return savedFiche;
    } catch (err) {
      console.error("Erreur lors de l'ajout de la mémofiche:", err);
      setError("L'ajout de la mémofiche a échoué.");
      throw err;
    }
  }, [token]);
  
  const deleteMemoFiche = useCallback(async (id: string): Promise<void> => {
    const originalData = data;
    // Optimistic update
    setData(prevData => {
        if (!prevData) return null;
        const newMemoFiches = prevData.memofiches.filter(mf => mf.id !== id);
        return { ...prevData, memofiches: newMemoFiches };
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/memofiches/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('La suppression a échoué sur le serveur');
      }
    } catch (err) {
        console.error("Erreur lors de la suppression de la mémofiche:", err);
        setError("La suppression a échoué. Restauration des données.");
        setData(originalData); // Rollback
    }
  }, [data, token]);

  const updateMemoFiche = useCallback(async (updatedFiche: MemoFiche): Promise<MemoFiche> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/memofiches/${updatedFiche.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatedFiche),
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Impossible de mettre à jour la mémofiche: ${errorBody}`);
      }
      const savedFiche: MemoFiche = await response.json();

      setData(prevData => {
        if (!prevData) return null;
        const updatedMemoFiches = prevData.memofiches.map(mf =>
          mf.id === savedFiche.id ? savedFiche : mf
        );
        return { ...prevData, memofiches: updatedMemoFiches };
      });
      return savedFiche;
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la mémofiche:", err);
      setError("La mise à jour de la mémofiche a échoué.");
      throw err;
    }
  }, [token]);

  const getMemoFicheById = useCallback((id: string): MemoFiche | undefined => {
    return data?.memofiches.find(mf => mf.id === id);
  }, [data]);
  
  const value = useMemo(() => ({ data, loading, error, getMemoFicheById, addMemoFiche, deleteMemoFiche, updateMemoFiche }), [data, loading, error, getMemoFicheById, addMemoFiche, deleteMemoFiche, updateMemoFiche]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

const MemoFicheDetailWrapper = () => {
    const { id } = useParams<{ id: string }>();
    const { getMemoFicheById, loading } = useData();
    if (!id) return <div className="text-center text-red-500 p-8">ID de mémofiche manquant.</div>;
    const memoFiche = getMemoFicheById(id);
    if (loading && !memoFiche) return <div className="mt-20"><LoadingSpinner /></div>;
    if (!memoFiche) return <div className="text-center text-red-500 p-8">Mémofiche non trouvée.</div>;
    return <DetailPage memoFiche={memoFiche} />;
};

const ProtectedRoute: React.FC = () => {
    const { canGenerateMemoFiche, isLoggedIn } = useAuth();
    if (!isLoggedIn) {
        return <Navigate to="/connexion" replace />;
    }
    if (!canGenerateMemoFiche) {
       return <Navigate to="/fiches" replace />;
    }
    return <Outlet />;
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <HashRouter>
          <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/connexion" element={<LoginPage />} />
                <Route path="/fiches" element={<FichesPage />} />
                <Route path="/fiches/:id" element={<MemoFicheDetailWrapper />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/generateur" element={<GeneratorPage />} />
                <Route path="/edit-memofiche/:id" element={<GeneratorPage />} />
                </Route>
              </Routes>
            </main>
          </div>
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
