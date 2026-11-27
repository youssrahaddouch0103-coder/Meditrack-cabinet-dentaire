export interface Specialty {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const SPECIALTIES: Specialty[] = [
  {
    id: 'medecine-generale',
    name: 'Médecine générale',
    icon: 'stethoscope',
    description: 'Consultations de premier recours, bilans de santé, suivi des maladies chroniques et orientation vers le bon spécialiste.'
  },
  {
    id: 'dentaire',
    name: 'Soins dentaires',
    icon: 'dentistry',
    description: 'Couronnes, restaurations, prothèses, détartrage et blanchiment, réalisés par notre équipe dentaire.'
  },
  {
    id: 'pediatrie',
    name: 'Pédiatrie',
    icon: 'child_care',
    description: 'Suivi de la croissance, vaccinations et consultations pour les nourrissons, enfants et adolescents.'
  },
  {
    id: 'cardiologie',
    name: 'Cardiologie',
    icon: 'cardiology',
    description: 'Dépistage et suivi des maladies du cœur et des vaisseaux, électrocardiogramme et bilan tensionnel.'
  },
  {
    id: 'gynecologie',
    name: 'Gynécologie',
    icon: 'pregnant_woman',
    description: 'Suivi gynécologique, contraception et accompagnement de la grossesse.'
  },
  {
    id: 'dermatologie',
    name: 'Dermatologie',
    icon: 'dermatology',
    description: 'Diagnostic et traitement des affections de la peau, des cheveux et des ongles.'
  }
];

export function specialtyName(id: string): string {
  return SPECIALTIES.find(s => s.id === id)?.name ?? '';
}
