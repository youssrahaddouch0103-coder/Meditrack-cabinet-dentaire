import { EntityId } from './common.model';
export type StatutAvis = 'EN_ATTENTE' | 'APPROUVE' | 'REFUSE';

export interface CreationAvisRequest {
  nomAuteur: string;
  note: number;
  soinConcerne: string;
  commentaire: string;
}

export interface AvisResponse {
  id: EntityId;
  nomAuteur: string;
  note: number;
  soinConcerne: string;
  commentaire: string;
  statut: StatutAvis;
  dateCreation: string;
  dateDecision?: string;
}
