
import { PharmIaData } from '../types';

export const INITIAL_DATA: PharmIaData = {
  themes: [
    { id: 'maladies-courantes', Nom: 'Maladies courantes', description: 'Pathologies fréquemment rencontrées à l\'officine' },
    { id: 'ordonnances', Nom: 'Ordonnances', description: 'Analyse et validation des prescriptions' },
    { id: 'micronutrition', Nom: 'Micronutrition', description: 'Conseils nutritionnels et compléments alimentaires' },
    { id: 'dermocosmetique', Nom: 'Dermocosmétique', description: 'Produits de beauté et soins cutanés' },
    { id: 'dispositifs-medicaux', Nom: 'Dispositifs Médicaux', description: 'Matériel médical et paramédical' },
    { id: 'pharmacie-veterinaire', Nom: 'Pharmacie vétérinaire', description: 'Médicaments et soins pour animaux' },
    { id: 'communication', Nom: 'Communication', description: 'Techniques de conseil et relation client' },
  ],
  systemesOrganes: [
    { id: 'orl-respiration', Nom: 'ORL & Respiration', description: 'Troubles respiratoires et ORL' },
    { id: 'digestion', Nom: 'Digestion', description: 'Pathologies digestives et gastro-intestinales' },
    { id: 'sante-cutanee', Nom: 'Santé cutanée', description: 'Dermatologie et soins de la peau' },
    { id: 'muscles-articulations', Nom: 'Muscles & Articulations', description: 'Rhumatologie et traumatologie' },
    { id: 'sante-feminine', Nom: 'Santé Féminine', description: 'Gynécologie et contraception' },
    { id: 'cardio-circulation', Nom: 'Cardio & Circulation', description: 'Cardiologie et troubles vasculaires' },
    { id: 'pediatrie', Nom: 'Pédiatrie', description: 'Soins spécifiques aux enfants' },
    { id: 'sommeil-stress', Nom: 'Sommeil & Stress', description: 'Troubles du sommeil et gestion du stress' },
  ],
  memofiches: [],
};