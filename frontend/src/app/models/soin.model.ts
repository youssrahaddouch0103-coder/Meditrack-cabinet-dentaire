import { EntityId } from './common.model';
export type StatutSoin = 'PUBLIE' | 'MASQUE' | 'ARCHIVE';

export interface Soin {
  id: EntityId;
  codeSlug: string;
  titre: string;
  descriptionCourte: string;
  descriptionDetaillee: string;
  photoCouvertureUrl: string;
  photoCouvertureAlt?: string;
  ordreAffichage: number;
  statut: StatutSoin;
  dateCreation?: string;
  dateModification?: string;
}

export interface CreationSoinRequest {
  titre: string;
  descriptionCourte: string;
  descriptionDetaillee: string;
  photoCouvertureAlt?: string;
  ordreAffichage?: number;
  statut?: StatutSoin;
}
