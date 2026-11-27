import { EntityId } from './common.model';
export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export type Role = 'patient' | 'medecin' | 'infirmier' | 'pharmacien' | 'admin';

export interface AppUser {
  id: EntityId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: Role;
}

export interface JwtAuthResponse {
  token: string;
  tokenType: string;
  email: string;
  role: Role;
  user?: AppUser;
}

/** Réponse du login quand un code 2FA est demandé (HTTP 202). */
export interface TwoFactorChallengeResponse {
  twoFactorRequired: true;
  challengeId: string;
  message: string;
}

export type LoginResponse = JwtAuthResponse | TwoFactorChallengeResponse;

export function isTwoFactorChallenge(r: LoginResponse): r is TwoFactorChallengeResponse {
  return (r as TwoFactorChallengeResponse).twoFactorRequired === true;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface GenericResponse {
  success: boolean;
  message: string;
}

export interface AdminAccountInfoResponse {
  id: EntityId;
  nom: string;
  loginEmail: string;
  role: string;
  actif: boolean;
  dateCreation: string;
  dateModification: string;
  activeRecoveryCodesCount: number;
}

export interface EmergencyCodesResponse {
  codes: string[];
  warning: string;
}
