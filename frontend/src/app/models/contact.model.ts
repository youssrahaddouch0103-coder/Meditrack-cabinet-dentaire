import { EntityId } from './common.model';
export interface CreationMessageContactRequest {
  nomComplet: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
}

export interface MessageContactResponse {
  id: EntityId;
  nomComplet: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
  dateEnvoi: string;
  lu: boolean;
}
