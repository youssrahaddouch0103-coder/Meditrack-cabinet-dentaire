/** Données de démarrage : spécialités du centre et médecins de l'équipe. */
exports.specialties = [
  { slug: 'medecine-generale', name: 'Médecine générale', icon: 'stethoscope', description: 'Consultations de premier recours, bilans de santé et suivi des maladies chroniques.' },
  { slug: 'dentaire', name: 'Soins dentaires', icon: 'dentistry', description: 'Couronnes, restaurations, prothèses, détartrage et blanchiment.' },
  { slug: 'pediatrie', name: 'Pédiatrie', icon: 'child_care', description: 'Suivi de la croissance, vaccinations et consultations des enfants.' },
  { slug: 'cardiologie', name: 'Cardiologie', icon: 'cardiology', description: 'Dépistage et suivi des maladies du cœur et des vaisseaux.' },
  { slug: 'gynecologie', name: 'Gynécologie', icon: 'pregnant_woman', description: 'Suivi gynécologique et accompagnement de la grossesse.' },
  { slug: 'dermatologie', name: 'Dermatologie', icon: 'dermatology', description: 'Affections de la peau, des cheveux et des ongles.' }
];

exports.doctors = [
  { firstName: 'Youness', lastName: 'Kâa', email: 'youness.kaa@meditrack.ma', title: 'Chirurgien-dentiste', specialty: 'dentaire' },
  { firstName: 'Tarik', lastName: 'À compléter', email: 'tarik@meditrack.ma', title: 'Chirurgien-dentiste', specialty: 'dentaire' }
];
