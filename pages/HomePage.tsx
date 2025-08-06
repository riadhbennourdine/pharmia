
import React from 'react';
import { Link } from 'react-router-dom';
import {
    CapsuleIcon,
    StethoscopeIcon,
    LeafIcon,
    DermocosmeticIcon,
    MedicalDeviceIcon,
    VeterinaryIcon,
    CommunicationIcon
} from '../components/icons';

const ThemeCard = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <div className="bg-white border border-gray-200/75 rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-3 transition-colors hover:border-gray-300 h-full">
        <div className="text-green-600">{icon}</div>
        <span className="font-medium text-gray-800 text-sm">{title}</span>
    </div>
);

const HomePage: React.FC = () => {
    const learningThemes = [
        { title: "Maladies courantes", icon: <CapsuleIcon className="w-9 h-9" /> },
        { title: "Ordonnances", icon: <StethoscopeIcon className="w-9 h-9" /> },
        { title: "Micronutrition", icon: <LeafIcon className="w-9 h-9" /> },
        { title: "Dermocosmétique", icon: <DermocosmeticIcon className="w-9 h-9" /> },
        { title: "Dispositifs Médicaux", icon: <MedicalDeviceIcon className="w-9 h-9" /> },
        { title: "Pharmacie vétérinaire", icon: <VeterinaryIcon className="w-9 h-9" /> },
    ];

    const communicationTheme = { title: "Communication", icon: <CommunicationIcon className="w-9 h-9" /> };

    return (
        <div className="w-full bg-slate-50 text-gray-900">
            {/* Hero Section */}
            <section className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
                        Mémofiches Conseils à l'Officine <br />avec <span className="animated-gradient-text font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-green-500 to-green-700">PharmIA</span>
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                        Votre partenaire d'apprentissage intelligent pour exceller à l'officine grâce à des mémofiches interactives et personnalisées.
                    </p>
                </div>
            </section>

            {/* Learning Themes Section */}
            <section className="py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold">Nos Thèmes d'Apprentissage</h2>
                    </div>
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                            {learningThemes.map(theme => (
                                <ThemeCard key={theme.title} icon={theme.icon} title={theme.title} />
                            ))}
                        </div>
                        <div className="mt-5 flex justify-center">
                             <div className="w-1/2 md:w-1/3 px-[10px]">
                                <ThemeCard icon={communicationTheme.icon} title={communicationTheme.title} />
                             </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* CTA Section */}
            <section className="pb-24 pt-4">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="max-w-xl mx-auto text-md text-gray-600 mb-8">
                         Explorez nos modules de micro-apprentissage adaptatif, conçus pour renforcer vos compétences sur les sujets clés rencontrés chaque jour.
                    </p>
                    <Link
                        to="/fiches"
                        className="inline-block bg-green-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-green-700 transition-transform duration-300 hover:scale-105"
                    >
                        Commencer à Apprendre
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
                    &copy; 2025 PharmIA. Micro-apprentissage intelligent pour la pharmacie.
                </div>
            </footer>
        </div>
    );
};

export default HomePage;