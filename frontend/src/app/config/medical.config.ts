export interface Specialty {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const SPECIALTIES: Specialty[] = [
  {
    id: 'dentisterie-generale',
    name: 'Soins dentaires',
    icon: 'dentistry',
    description: 'Consultations, détartrage, traitement des caries et dévitalisations.'
  },
  {
    id: 'orthodontie',
    name: 'Orthodontie',
    icon: 'sentiment_satisfied',
    description: 'Alignement des dents par appareils fixes ou gouttières, pour enfants et adultes.'
  },
  {
    id: 'implantologie',
    name: 'Implantologie',
    icon: 'hardware',
    description: 'Remplacement des dents manquantes par implants et couronnes sur implant.'
  },
  {
    id: 'protheses',
    name: 'Prothèses dentaires',
    icon: 'medical_services',
    description: 'Couronnes, bridges et prothèses amovibles réalisés sur mesure.'
  },
  {
    id: 'pedodontie',
    name: 'Pédodontie',
    icon: 'child_care',
    description: 'Soins dentaires adaptés aux enfants, prévention et suivi de la croissance dentaire.'
  },
  {
    id: 'esthetique',
    name: 'Esthétique dentaire',
    icon: 'auto_awesome',
    description: 'Blanchiment, facettes et soins esthétiques pour un sourire harmonieux.'
  }
];

export function specialtyName(id: string): string {
  return SPECIALTIES.find(s => s.id === id)?.name ?? '';
}
