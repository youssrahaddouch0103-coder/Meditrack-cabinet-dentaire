import { EntityId } from './common.model';
export interface TeamMember {
  id: EntityId;
  nomComplet: string;
  titre: string;
  specialite?: string;
  description?: string;
  photoUrl?: string;
  photoAlt?: string;
  ordreAffichage: number;
  actif: boolean;
  instagramUrl?: string;
  linkedinUrl?: string;
  dateCreation?: string;
  dateModification?: string;

  // Frontend helper properties
  specialtiesList?: string[];
}
