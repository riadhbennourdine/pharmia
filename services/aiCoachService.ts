import { MemoFiche } from '../types';

export interface Recommendation {
  fiche: MemoFiche;
  reason: string;
}

export const getRecommendations = async (userId: string): Promise<Recommendation[]> => {
  // In a real application, this would make an API call to the backend.
  // For now, we'll return some mock data.
  console.log(`Fetching recommendations for user ${userId}...`);
  
  // Mock data - assuming we have access to all fiches
  // In a real scenario, the backend would handle this logic
  const allFiches: MemoFiche[] = []; // This should be populated with actual data

  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        {
          // This is just an example, replace with a real fiche object
          fiche: { 
            id: '1', 
            title: 'Cardiologie: Les anti-hypertenseurs',
            theme: { id: '1', Nom: 'Cardiologie' },
            systeme_organe: { id: '1', Nom: 'Système Cardiovasculaire' },
            // ... other required fields
          } as MemoFiche,
          reason: 'J\'ai remarqué que vous avez eu des difficultés avec les quiz sur la cardiologie. Je vous recommande de revoir cette fiche pour renforcer vos connaissances.',
        },
        {
          fiche: { 
            id: '2', 
            title: 'Diabétologie: Les insulines',
            theme: { id: '2', Nom: 'Diabétologie' },
            systeme_organe: { id: '2', Nom: 'Système Endocrinien' },
          } as MemoFiche,
          reason: 'Vous avez récemment consulté plusieurs fiches sur le diabète. Continuez sur votre lancée!',
        },
      ]);
    }, 1000);
  });
};
