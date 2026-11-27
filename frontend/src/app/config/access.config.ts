import { Role } from '../models/auth.model';

/** Rôles qui ont accès à l'espace de gestion (/admin). */
export const STAFF_ROLES: Role[] = ['admin', 'medecin', 'infirmier', 'pharmacien'];

/** Rôles autorisés pour chaque page de l'espace de gestion. */
export const ADMIN_PAGE_ROLES: Record<string, Role[]> = {
  'tableau-de-bord': STAFF_ROLES,
  'rendez-vous': ['admin', 'medecin', 'infirmier'],
  soins: ['admin'],
  messages: ['admin'],
  avis: ['admin'],
  equipe: ['admin'],
  contenu: ['admin']
};

export const ROLE_LABELS: Record<Role, string> = {
  patient: 'Patient',
  medecin: 'Médecin',
  infirmier: 'Infirmier',
  pharmacien: 'Pharmacien',
  admin: 'Administrateur'
};
