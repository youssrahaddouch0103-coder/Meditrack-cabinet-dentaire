/** Données de démarrage : spécialités du cabinet et dentistes de l'équipe. */
exports.specialties = [
  { slug: 'dentisterie-generale', name: 'Soins dentaires', icon: 'dentistry', description: 'Consultations, détartrage, traitement des caries et dévitalisations.' },
  { slug: 'orthodontie', name: 'Orthodontie', icon: 'sentiment_satisfied', description: 'Alignement des dents par appareils fixes ou gouttières, pour enfants et adultes.' },
  { slug: 'implantologie', name: 'Implantologie', icon: 'hardware', description: 'Remplacement des dents manquantes par implants et couronnes sur implant.' },
  { slug: 'protheses', name: 'Prothèses dentaires', icon: 'medical_services', description: 'Couronnes, bridges et prothèses amovibles réalisés sur mesure.' },
  { slug: 'pedodontie', name: 'Pédodontie', icon: 'child_care', description: 'Soins dentaires adaptés aux enfants, prévention et suivi de la croissance dentaire.' },
  { slug: 'esthetique', name: 'Esthétique dentaire', icon: 'auto_awesome', description: 'Blanchiment, facettes et soins esthétiques pour un sourire harmonieux.' }
];

exports.doctors = [
  { firstName: 'Youness', lastName: 'Kâa', email: 'youness.kaa@meditrack.ma', title: 'Chirurgien-dentiste', specialty: 'dentisterie-generale' },
  { firstName: 'Tarik', lastName: '', email: 'tarik@meditrack.ma', title: 'Chirurgien-dentiste', specialty: 'dentisterie-generale' }
];
