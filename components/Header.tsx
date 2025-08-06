
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const Header: React.FC = () => {
  const { isLoggedIn, logout, canEdit } = useAuth();
  const navigate = useNavigate();
  
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

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 h-16 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold tracking-tight">
            <span className="animated-gradient-text font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-600 to-green-800">PharmIA</span>
          </Link>
          <nav className="flex items-center space-x-1">
            <NavLink to="/" className={navLinkClass} end>
              Accueil
            </NavLink>
            <NavLink to="/fiches" className={navLinkClass}>
              Mémofiches
            </NavLink>
            {canEdit && (
              <NavLink to="/generateur" className={navLinkClass}>
                Générateur
              </NavLink>
            )}
            {isLoggedIn ? (
              <button onClick={handleLogout} className={navLinkClass({isActive: false})}>
                Déconnexion
              </button>
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
