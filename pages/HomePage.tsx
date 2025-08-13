
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';


const ThemeCard = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <div className="bg-white border border-gray-200/75 rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-3 transition-all duration-300 hover:border-green-400 hover:shadow-lg hover:scale-105 h-full">
        <div className="text-green-600">{icon}</div>
        <span className="font-medium text-gray-800 text-sm">{title}</span>
    </div>
);

const HomePage: React.FC = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    const handleStartLearningClick = () => {
        if (isLoggedIn) {
            navigate('/fiches');
        } else {
            navigate('/connexion');
        }
    };

    const iconBaseUrl = "https://pharmaconseilbmb.com/photos/site/icone/png/";

    const trainers = [
        { name: "Riadh Barhoumi", imageUrl: "https://pharmaconseilbmb.com/photos/site/formateur/1.png", title: "Pharmacien Coach & Formateur", phone: "+216 52 847 241", email: "contact@pharmaconseilbmb.com", social: { facebook: "", linkedin: "" } },
        { name: "Emna Mili", imageUrl: "https://pharmaconseilbmb.com/photos/site/formateur/2.png", title: "Pharmacienne Formatrice", phone: "+216 56 599 000", email: "emnamili0106@gmail.com", social: { facebook: "", linkedin: "" } },
        { name: "Senda Yahia", imageUrl: "https://pharmaconseilbmb.com/photos/site/formateur/3.png", title: "Pharmacienne Formatrice", phone: "+216 58 678 441", email: "yahiasenda92@gmail.com", social: { facebook: "", linkedin: "" } },
        { name: "Ghassen Khalaf", imageUrl: "https://pharmaconseilbmb.com/photos/site/formateur/4.png", title: "Pharmacien Formateur", phone: "+216 27 775 315", email: "", social: { facebook: "", linkedin: "" } },
        { name: "Kmar Ben Abdessalem", imageUrl: "https://pharmaconseilbmb.com/photos/site/formateur/5.png", title: "Pharmacienne Formatrice", phone: "", email: "", social: { facebook: "", linkedin: "" } },
    ];

    const learningThemes = [
        { title: "Maladies courantes", icon: <img src={`${iconBaseUrl}1.png`} alt="Maladies courantes" className="w-12 h-12" /> },
        { title: "Ordonnances", icon: <img src={`${iconBaseUrl}2.png`} alt="Ordonnances" className="w-12 h-12" /> },
        { title: "Micronutrition", icon: <img src={`${iconBaseUrl}3.png`} alt="Micronutrition" className="w-12 h-12" /> },
        { title: "Dermocosmétique", icon: <img src={`${iconBaseUrl}4.png`} alt="Dermocosmétique" className="w-12 h-12" /> },
        { title: "Dispositifs Médicaux", icon: <img src={`${iconBaseUrl}5.png`} alt="Dispositifs Médicaux" className="w-12 h-12" /> },
        { title: "Pharmacie vétérinaire", icon: <img src={`${iconBaseUrl}6.png`} alt="Pharmacie vétérinaire" className="w-12 h-12" /> },
    ];

    const communicationTheme = { title: "Communication", icon: <img src={`${iconBaseUrl}8.png`} alt="Communication" className="w-12 h-12" /> };

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

            {/* Video Presentation Section (moved and styled) */}
            <section className="py-16 bg-slate-100"> {/* Keep background color */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">Découvrez PharmIA en Vidéo</h2>
                    {/* Added max-w-3xl and mx-auto for centering and size reduction */}
                    <div className="relative max-w-3xl mx-auto" style={{ paddingBottom: '56.25%', height: 0 }}>
                        <iframe
                            src="https://www.youtube.com/embed/sR3C9j3Tcqo?modestbranding=1&showinfo=0&rel=0"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Présentation PharmIA"
                            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-xl"
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* Trainers Section */}
            <section className="py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800">Nos Formateurs Experts</h2>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
                        {trainers.map((trainer, index) => (
                            <div key={index} className="group relative flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 w-72">
                                <img src={trainer.imageUrl} alt={trainer.name} className="w-32 h-32 rounded-full object-cover mb-4 border-2 border-green-500 transition-transform duration-300 group-hover:scale-110" />
                                <h3 className="text-xl font-semibold text-gray-800 mb-1">{trainer.name}</h3>
                                <p className="text-gray-600 text-sm">{trainer.title}</p>

                                {/* Overlay for contact info */}
                                <div className="absolute inset-0 bg-green-600 bg-opacity-90 flex flex-col items-center justify-center p-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <h3 className="text-xl font-semibold text-white mb-2">{trainer.name}</h3>
                                    <div className="space-y-2 text-white text-sm">
                                        {trainer.phone && (
                                            <a href={`tel:${trainer.phone}`} className="flex items-center gap-2 hover:underline">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.106l-1.412-.353a1.125 1.125 0 0 1-.924-.24l-.46-.309A1.125 1.125 0 0 0 15 12.75V15m0 0l-2.25 2.25M15 15l2.25-2.25M15 15h3.75m-3.75 0H12m-2.25-4.5H12m-2.25 0H9.75m-2.25 0H7.5m-2.25 0H5.25M2.25 6.75h-.008v.008H2.25V6.75Zm.008 0H2.25V6.75h.008Z" /></svg>
                                                {trainer.phone}
                                            </a>
                                        )}
                                        {trainer.email && (
                                            <a href={`mailto:${trainer.email}`} className="flex items-center gap-2 hover:underline">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5A2.25 2.25 0 0 0 2.25 6.75m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.903l-11.25 6.468a2.25 2.25 0 0 1-2.102 0L2.25 8.993A2.25 2.25 0 0 1 1.18 7.03M2.25 6.75h-.008v.008H2.25V6.75Z" /></svg>
                                                {trainer.email}
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex gap-4 mt-4">
                                        {trainer.social.facebook && (
                                            <a href={trainer.social.facebook} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.243-1.333 1.506-1.333h2.494v-4h-3.5c-4 0-5 3.055-5 5v2z"/></svg>
                                            </a>
                                        )}
                                        {trainer.social.linkedin && (
                                            <a href={trainer.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 6.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-8.745c0-5.635-3.349-6.034-5.982-6.034-2.579 0-4.434 1.596-4.434 1.596v-1.42h-5.018z"/></svg>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="pb-24 pt-4">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="max-w-xl mx-auto text-md text-gray-600 mb-8">
                         Explorez nos modules de micro-apprentissage adaptatif, conçus pour renforcer vos compétences sur les cas comptoir pratiques rencontrés au quotidien de l'officine.
                    </p>
                    <button
                        onClick={handleStartLearningClick}
                        className="inline-block bg-green-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-green-700 transition-transform duration-300 hover:scale-105"
                    >
                        Commencer à Apprendre
                    </button>
                    {/* New text for trial */}
                    <p className="mt-4 text-center text-lg font-semibold text-green-700">
                        Essayez Gratuitement nos Mémofiches !
                    </p>
                    <p className="mt-1 text-center text-sm text-gray-500">
                        Période d'essai de 14 jours
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
                    &copy; 2025 PharmIA. Micro-apprentissage adaptatif pour l'officine.
                </div>
            </footer>
        </div>
    );
};

export default HomePage;