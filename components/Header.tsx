
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const Header: React.FC = () => {
  const { isLoggedIn, logout, canGenerateMemoFiche, username } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium px-3 py-2 rounded-md transition-colors ${
      isActive
        ? 'text-green-600 font-semibold'
        : 'text-gray-500 hover:text-green-600'
    }`;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 h-16 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold">
            <span className="animated-gradient-text font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-600 to-green-800">PharmIA</span>
          </Link>
          <nav className="flex items-center space-x-1">
            <NavLink to="/" className={navLinkClass} end>
              Accueil
            </NavLink>
            <NavLink to="/fiches" className={navLinkClass}>
              Mémofiches
            </NavLink>
            {canGenerateMemoFiche && (
              <NavLink to="/generateur" className={navLinkClass}>
                Générateur
              </NavLink>
            )}
            {isLoggedIn ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center text-sm font-medium px-3 py-2 rounded-md transition-colors text-gray-500 hover:text-green-600">
                  {username}
                  <svg className={`w-4 h-4 ml-1 transition-transform ${isMenuOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <NavLink to="/learner-space" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                      Espace d'apprentissage
                    </NavLink>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink to="/connexion" className={navLinkClass}>
                Connexion
              </NavLink>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
